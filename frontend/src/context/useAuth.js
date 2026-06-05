import { useContext } from 'react';
import { AuthContext } from './auth-state-context';

export const useAuth = () => useContext(AuthContext);
