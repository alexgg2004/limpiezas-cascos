/**
 * Fecha en formato ISO (yyyy-MM-dd) usando el calendario LOCAL, no UTC.
 * `Date.toISOString()` convierte a UTC primero, lo que desplaza el día
 * cerca de la medianoche según el huso horario — aquí queremos el mismo
 * "día" que ve el usuario (y que usa `LocalDate` en el backend).
 */
export function fechaLocalIso(d: Date): string {
  const año = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}
