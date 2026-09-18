import { useState } from "react";
import { useJuego } from "./game/store";
import { Intro, Creador, Mapa } from "./components/Pantallas";
import { Nivel } from "./components/Nivel";
import { LeccionView } from "./components/Leccion";
import { Cargando, AvisoGuardado } from "./components/Sistema";

export default function App() {
  const j = useJuego();
  const [cargando, setCargando] = useState(true);

  if (cargando) return <Cargando onListo={() => setCargando(false)} />;

  return (
    <>
      {j.pantalla === "intro" && <Intro />}
      {j.pantalla === "creador" && <Creador />}
      {j.pantalla === "leccion" && j.reinoActual && <LeccionView key={j.reinoActual} />}
      {j.pantalla === "nivel" && j.nivelActual && <Nivel key={j.nivelActual} />}
      {j.pantalla === "mapa" && <Mapa />}
      <AvisoGuardado />
    </>
  );
}