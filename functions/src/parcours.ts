import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

type DocumentSnapshot = admin.firestore.DocumentSnapshot;
type Change = functions.Change<DocumentSnapshot>;

interface ParcoursData {
  domaine: string;
  niveau: string;
  ordre: number;
}

export const onParcoursStatusUpdate = functions.firestore
  .document("users/{userId}/parcours/{parcoursId}")
  .onWrite(async (change: Change, context: functions.EventContext) => {
    const {userId, parcoursId} = context.params;

    // Si le document a été supprimé, on ne fait rien
    if (!change.after.exists) {
      return null;
    }

    const newData = change.after.data();
    const oldData = change.before.exists ? change.before.data() : null;

    // On vérifie si le statut a changé pour "completed"
    if (newData?.status === "completed" && oldData?.status !== "completed") {
      try {
        const db = admin.firestore();

        // 1. Récupérer le parcours complété directement par son ID
        const parcoursDoc = await db
          .collection("parcours")
          .doc(parcoursId)
          .get();

        if (!parcoursDoc.exists) {
          const errorMsg =
            `Parcours ${parcoursId} non trouvé dans la collection parcours`;
          console.error(errorMsg);
          return null;
        }

        // 2. Récupérer les informations domaine, niveau et ordre
        const parcoursData = parcoursDoc.data() as ParcoursData;

        if (!parcoursData.domaine ||
            !parcoursData.niveau ||
            typeof parcoursData.ordre !== "number") {
          console.error("Données du parcours invalides:", parcoursData);
          return null;
        }

        const {domaine, niveau, ordre} = parcoursData;

        console.log("Parcours complété:", {
          id: parcoursId,
          domaine,
          niveau,
          ordre,
        });

        // 3. Chercher le prochain parcours
        const nextParcoursQuery = await db.collection("parcours")
          .where("domaine", "==", domaine)
          .where("niveau", "==", niveau)
          .where("ordre", "==", ordre + 1)
          .get();

        // 4. Si un parcours suivant existe, le débloquer
        if (!nextParcoursQuery.empty) {
          const nextParcours = nextParcoursQuery.docs[0];
          const nextParcoursId = nextParcours.id;

          console.log("Parcours suivant trouvé:", {
            id: nextParcoursId,
            domaine,
            niveau,
            ordre: ordre + 1,
          });

          // 5. Mettre à jour le statut dans la sous-collection
          const userParcoursRef =
            `users/${userId}/parcours/${nextParcoursId}`;

          await db.doc(userParcoursRef).set({
            userId,
            parcoursId: nextParcoursId,
            domaine,
            status: "unblocked",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          }, {merge: true});

          console.log(`Parcours ${nextParcoursId} débloqué pour ${userId}`);
        } else {
          console.log("Aucun parcours suivant trouvé pour:", {
            domaine,
            niveau,
            ordre: ordre + 1,
          });
        }
      } catch (error) {
        const errorMsg = "Erreur lors du traitement du changement de statut:";
        console.error(errorMsg, error);
        throw error;
      }
    }

    return null;
  });
