/**
 * Constantes da API
 */

export const API_CONFIG = {
  BASE_URL: "https://integra.cellarvinhos.com",
  ENDPOINTS: {
    LOGIN: "/webhook/9c4dffae-1b96-4394-a141-36e50d98f657",
    EMPLOYEES: "/webhook/3908bf18-a50b-4e76-a9ff-97c5edf17d4c",
    DEPARTMENTS: "/webhook/f89c9b5c-22de-4b47-a4e1-c9b964213e86",
    HIERARCHY_LEVELS: "/webhook/9316c62f-43d0-41f0-986e-bee4c2758725",
    POSITIONS: "/webhook/c7c29384-86ec-416a-806e-ab98bddfbd71",
    DIRECTORATES: "/webhook/88302b63-8d9e-42fe-b270-e78e05f5fdd2",
    SHIFTS: "/webhook/d5d692eb-f8db-455c-95c2-4cdee06e0881",
    UNITS: "/webhook/46083d19-8a43-4286-872a-d155d1e154f1",
    FORMS: "/webhook/d5c2cb69-640b-40ea-8864-241c6d46c46b",
    FORM_QUESTIONS: "/webhook/f74e24f3-eb53-456e-afa3-c4553519c046",
  },
  STORAGE: {
    TOKEN_COOKIE: "cellarRhAuth",
    USER_KEY: "cellarRh_user",
  },
} as const;
