/**
 * Convertit un temps en secondes en un format lisible (HH:MM:SS ou MM:SS)
 * @param seconds - Durée en secondes
 * @returns Format lisible de la durée
 */
export const getDisplayTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format avec zéro devant si nécessaire
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  // Si plus d'une heure, afficher au format HH:MM:SS
  if (hours > 0) {
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  // Sinon, afficher au format MM:SS
  return `${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Convertit un temps en secondes en un format textuel (X heures Y minutes)
 * @param seconds - Durée en secondes
 * @returns Format textuel de la durée
 */
export const getTextDisplayTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) {
    return 'Durée inconnue';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Moins d\'une minute';
  }
}; 