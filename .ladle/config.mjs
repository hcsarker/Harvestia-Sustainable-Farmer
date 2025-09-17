import react from "@vitejs/plugin-react-swc";
import path from "path";

/** @type {import('@ladle/react').UserConfig} */
export default {
  vite: {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
  },
};
