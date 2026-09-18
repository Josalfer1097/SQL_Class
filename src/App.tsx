import { useJuego } from "./game/store";
import { Intro, Creador, Mapa } from "./components/Pantallas";
import { Nivel } from "./components/Nivel";
import { LeccionView } from "./components/Leccion";

export default function App() {
  const j = useJuego();
  if (j.pantalla === "intro") return <Intro />;
  if (j.pantalla === "creador") return <Creador />;
  if (j.pantalla === "leccion" && j.reinoActual) return <LeccionView key={j.reinoActual} />;
  if (j.pantalla === "nivel" && j.nivelActual) return <Nivel key={j.nivelActual} />;
  return <Mapa />;
}