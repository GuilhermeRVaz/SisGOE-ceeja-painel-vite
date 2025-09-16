// lib/core/utils/validators.dart

import { required, email, regex } from 'react-admin';

export const validateRequired = required('Este campo é obrigatório.');

export const validateEmail = email('Por favor, insira um e-mail válido.');

export const validateCpf = regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato de CPF inválido. Use XXX.XXX.XXX-XX.');

export const validatePhone = regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato de telefone inválido. Use (XX) XXXXX-XXXX.');

export const validateTerms = (value: any) => value ? undefined : 'Você deve aceitar os termos.';