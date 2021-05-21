import { isLoggedIn, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from 'axios-jwt'
import axios from "axios";

export const axiosInstance = axios.create({ baseURL: LOCAL_ENV });




export const logout = () => clearAuthTokens();
