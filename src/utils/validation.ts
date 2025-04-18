import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Veuillez entrer une adresse email valide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
});

export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .required('Le nom d\'utilisateur est requis'),
  email: yup
    .string()
    .email('Veuillez entrer une adresse email valide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
}); 