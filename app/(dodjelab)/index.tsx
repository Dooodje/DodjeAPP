import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';

// Définition du type pour l'analyse d'investissement
interface InvestmentAnalysis {
  profile: string;
  recommendations: string;
  generatedAt: string;
  lastUpdated: string;
}

// Composant Header personnalisé
interface HeaderProps {
  title: string;
  showBackButton: boolean;
  onBackPress: () => void;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton,
  onBackPress,
  rightIcon,
  onRightIconPress
}) => {
  return (
    <View style={headerStyles.container}>
      <View style={headerStyles.content}>
        {showBackButton && (
          <TouchableOpacity style={headerStyles.backButton} onPress={onBackPress}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        
        <Text style={headerStyles.title}>{title}</Text>
        
        {rightIcon && (
          <TouchableOpacity 
            style={headerStyles.rightButton} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
        
        {!rightIcon && <View style={headerStyles.placeholder} />}
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0400',
    paddingTop: 50,
    paddingBottom: 10,
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  }
});

export default function DodjeLabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<InvestmentAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'analyse existante au chargement
    if (user?.uid) {
      fetchUserAnalysis();
    }
  }, [user]);

  const fetchUserAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userRef = doc(db, 'users', user!.uid);
      const docSnap = await getDoc(userRef);
      
      // Vérifier si l'utilisateur a une analyse existante
      if (docSnap.exists() && docSnap.data().investmentAnalysis) {
        setAnalysis(docSnap.data().investmentAnalysis);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'analyse:', err);
      setError('Impossible de récupérer votre analyse. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuestionnaire = () => {
    router.push("/(dodjelab)/questionnaire");
  };

  const handleGenerateAnalysis = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      // Simuler un appel à une Cloud Function Firebase
      // Normalement ici vous feriez appel à la fonction "generateInvestmentAnalysis"
      // Simulation pour démonstration
      setTimeout(async () => {
        const mockAnalysis: InvestmentAnalysis = {
          profile: "Investisseur équilibré",
          recommendations: "Basé sur vos réponses, nous recommandons une allocation d'actifs diversifiée avec 40% d'actions, 40% d'obligations et 20% de liquidités. Votre tolérance au risque est modérée et votre horizon d'investissement à moyen terme suggère une approche équilibrée.",
          generatedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        // Enregistrer l'analyse dans Firestore
        const userRef = doc(db, 'users', user!.uid);
        await setDoc(userRef, { investmentAnalysis: mockAnalysis }, { merge: true });
        
        // Mettre à jour l'état local
        setAnalysis(mockAnalysis);
        setGenerating(false);
      }, 2500);
      
    } catch (err) {
      console.error('Erreur lors de la génération de l\'analyse:', err);
      setError('Une erreur est survenue lors de la génération de l\'analyse. Veuillez réessayer.');
      setGenerating(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleUpdateProfile = () => {
    router.push("/(dodjelab)/questionnaire");
  };

  // Formatage de la date au format français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#06D001" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      );
    }

    if (analysis) {
      // Si l'utilisateur a déjà une analyse, on l'affiche
      return (
        <View style={styles.analysisContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Votre profil d'investisseur</Text>
            <View style={styles.profileCard}>
              <Text style={styles.profileType}>{analysis.profile}</Text>
              <Text style={styles.lastUpdate}>
                Dernière mise à jour: {formatDate(analysis.lastUpdated)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommandations</Text>
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsText}>{analysis.recommendations}</Text>
            </View>
            
            <View style={styles.disclaimerContainer}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#CCCCCC" />
              <Text style={styles.disclaimerText}>
                Ces recommandations sont générées par une IA et ne constituent pas un conseil financier professionnel.
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={handleUpdateProfile}
          >
            <Text style={styles.updateButtonText}>Mettre à jour mon profil</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Si l'utilisateur n'a pas d'analyse, on propose de démarrer le questionnaire
    return (
      <View style={styles.noAnalysisContainer}>
        <View style={styles.welcomeSection}>
          <MaterialCommunityIcons name="robot" size={50} color="#06D001" style={styles.welcomeIcon} />
          <Text style={styles.welcomeTitle}>Bienvenue dans DodjeIA</Text>
          <Text style={styles.welcomeText}>
            Découvrez votre profil d'investisseur et obtenez des recommandations personnalisées pour optimiser vos investissements.
          </Text>
        </View>

        <View style={styles.questionnaireCta}>
          <Text style={styles.questionnaireCtaTitle}>
            Prêt à connaître votre profil d'investisseur ?
          </Text>
          <Text style={styles.questionnaireCtaText}>
            Répondez à notre questionnaire rapide pour obtenir une analyse personnalisée.
          </Text>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleStartQuestionnaire}
          >
            <Text style={styles.startButtonText}>Commencer le questionnaire</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.otherFeatures}>
          <Text style={styles.otherFeaturesTitle}>D'autres fonctionnalités IA arrivent bientôt !</Text>
          <Text style={styles.otherFeaturesText}>
            Restez à l'écoute pour découvrir nos prochaines fonctionnalités d'intelligence artificielle.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dodje Lab"
        showBackButton={true}
        onBackPress={handleBack}
        rightIcon={
          generating ? 
            <ActivityIndicator size="small" color="#FFFFFF" /> : 
            analysis ? 
              <MaterialCommunityIcons name="refresh" size={24} color="#FFFFFF" /> :
              undefined
        }
        onRightIconPress={analysis && !generating ? handleGenerateAnalysis : undefined}
      />
      
      <ScrollView style={styles.scrollView}>
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {generating && (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="small" color="#06D001" />
            <Text style={styles.generatingText}>Génération de votre analyse en cours...</Text>
          </View>
        )}
        
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0400',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginLeft: 8,
    flex: 1,
  },
  generatingContainer: {
    backgroundColor: 'rgba(6, 208, 1, 0.1)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  generatingText: {
    color: '#06D001',
    marginLeft: 8,
    flex: 1,
  },
  // Styles pour l'affichage de l'analyse
  analysisContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: '#11070B',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#06D001',
  },
  profileType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  recommendationsCard: {
    backgroundColor: '#11070B',
    borderRadius: 12,
    padding: 16,
  },
  recommendationsText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#06D001',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Styles pour l'écran sans analyse
  noAnalysisContainer: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeIcon: {
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  questionnaireCta: {
    backgroundColor: '#11070B',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  questionnaireCtaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  questionnaireCtaText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#06D001',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  otherFeatures: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  otherFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  otherFeaturesText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
  },
}); 