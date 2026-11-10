import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import { SupabaseAuthProvider } from "./components/SupabaseAuthProvider";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "jfTyVvaszM61duABCdzbEL",
      token:
        "XMoctwKeEOo6SHi0HNxYO0odZUmLJw3YAZpPEKPqf3bkLm1YpCx3v9pHX3ns5FRzyehyYFpS51GtLPBqoI0ow",
    },
  ],

  // By default Plasmic will use the last published version of your project.
  // For development, you can set preview to true, which will use the unpublished
  // project, allowing you to see your designs without publishing. Please
  // only use this for development, as this is significantly slower.
  preview: false,
});

PLASMIC.registerGlobalContext(SupabaseAuthProvider, {
  name: "SupabaseAuthProvider",
  displayName: "Supabase Auth",
  props: {},
  providesData: true,
  globalActions: {
    login: {
      displayName: "Login",
      parameters: [
        {
          name: "email",
          type: "string",
        },
        {
          name: "password",
          type: "string",
        },
      ],
    },

    logout: {
      displayName: "Logout",
      parameters: [],
    },

    clearLoginError: {
      displayName: "Clear login error",
      parameters: [],
    },
  },
});

// You can register any code components that you want to use here; see
// https://docs.plasmic.app/learn/code-components-ref/
// And configure your Plasmic project to use the host url pointing at
// the /plasmic-host page of your nextjs app (for example,
// http://localhost:3000/plasmic-host).
//
// PLASMIC.registerComponent(...);