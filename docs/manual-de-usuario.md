# Manual de usuario — VitalBridge RX PMO Dashboard

Versión 1.0 · Para: Henry (Project Manager y líder del PMO) y Ned (consulta)
Dirección: https://vitalbridge-pmo.vercel.app

Este manual describe lo que la aplicación hace **hoy**. Los textos de la pantalla están en inglés; aquí se citan tal como aparecen, entre comillas. Al final hay una sección con lo que todavía no se puede hacer.

---

## 1. Qué es y para qué sirve

Es un tablero único para gestionar los proyectos de VitalBridge RX: cada hospital que se rescata, y la construcción del propio PMO. Responde a una pregunta: **¿vamos bien?**

La metodología es la de los documentos del PMO: **cascada (waterfall) con puertas de decisión (gates)**. Un proyecto no pasa a la fase siguiente hasta que alguien decide formalmente "Go" en la puerta correspondiente.

### Quién puede hacer qué

| Rol | Qué puede hacer |
|---|---|
| **Owner** (Henry) | Ver y modificar todo: crear hospitales, registrar decisiones, cargar entregables, riesgos, dependencias, línea base, reuniones y to-dos. |
| **Viewer** (Ned) | Solo ver. No aparece ningún botón ni formulario para modificar. |

Esto no es solo visual: la base de datos rechaza cualquier escritura de un Viewer, aunque se intente saltar la pantalla.

---

## 2. Primer ingreso y seguridad

1. Abra la dirección e inicie sesión con su email y contraseña.
2. **Owner:** el sistema lo lleva a una pantalla de **verificación en dos pasos (TOTP)**.
   - La primera vez, escanee el código QR con una app de autenticación (Google Authenticator, Authy, 1Password).
   - **Guarde la clave secreta** que aparece bajo el QR en su gestor de contraseñas. Es su respaldo si pierde el teléfono.
   - Escriba el código de 6 dígitos y pulse "Verify".
   - Desde la segunda vez, solo pide el código de 6 dígitos.
3. **Viewer:** entra directo con email y contraseña. Si activa TOTP por su cuenta, también se le pedirá.

**Buenas prácticas**
- No comparta su usuario. Para que alguien más vea el tablero, cree una cuenta Viewer.
- Cierre sesión ("Sign out", abajo en el riel lateral) en computadoras compartidas.
- **No escriba datos de pacientes** en ningún campo. El sistema está diseñado solo para información comercial y de gestión.
- Tras 5 intentos fallidos de contraseña en 15 minutos, el login se bloquea temporalmente.

### Contraseña y recuperación de acceso

**Cambiar su contraseña (sabiendo la actual).** Pulse **"Account"** en el riel lateral → tarjeta "Password" → escriba la contraseña actual y la nueva dos veces → "Change password". La nueva debe tener **entre 12 y 72 caracteres**; una frase larga es más fuerte y más fácil de recordar. Al cambiarla, se cierran las sesiones abiertas en otros dispositivos.

**Olvidé mi contraseña.**
1. En la pantalla de inicio pulse **"Forgot password?"**, escriba su email y pulse "Send reset link".
2. Le llega un correo con el botón **"Choose a new password"**. El enlace funciona **una sola vez** y caduca pronto.
3. Se abre una página con el botón **"Continue"**: púlselo (esto evita que los antivirus de correo "gasten" el enlace).
4. **Si tiene verificación en dos pasos**, primero le pedirá el código de su app autenticadora ("Confirm it's you"); solo después podrá elegir la nueva contraseña.
5. Escriba la contraseña nueva dos veces y pulse "Update password".

La pantalla siempre responde lo mismo ("If an account exists…"), exista o no la cuenta: así nadie puede averiguar qué correos están registrados. **Si el correo no llega**, revise la carpeta de spam y vea el aviso sobre correo al final de este manual.

**Perdí el teléfono (código TOTP).** Existen los **códigos de recuperación**: 10 códigos de un solo uso.
- **Cuándo se crean:** al activar la verificación en dos pasos, la aplicación los muestra **una sola vez** ("Save your recovery codes"). Cópielos o descárguelos y guárdelos en su gestor de contraseñas. **No se vuelven a mostrar.**
- **Si ya tenía MFA antes de esta función**, aún no tiene códigos: en **Account → "Two-step verification" → "Generate new recovery codes"** se crean (un aviso amarillo en la parte superior se lo recuerda hasta que lo haga). Generar códigos nuevos **reemplaza** a los anteriores.
- **Cómo usarlos:** inicie sesión con su contraseña; en la pantalla del código pulse **"Lost your authenticator? Use a recovery code"**, escriba un código y pulse "Use recovery code". La aplicación quita el autenticador perdido y lo envía a iniciar sesión de nuevo, donde configurará uno nuevo (y recibirá 10 códigos nuevos).
- **Importante:** al usar un código, **todos los demás se invalidan**. Tras 5 intentos erróneos en 15 minutos, se bloquean más intentos un rato.

---

## 3. Cómo está organizada la pantalla

**Riel lateral izquierdo (burdeos):** Portfolio · Hospitals · PMO · Calendar. En la parte de abajo: su rol, el botón de modo claro/oscuro (se recuerda), **"Account"** (contraseña y códigos de recuperación) y "Sign out".

**Encabezado:** a la derecha, "Overall completion" muestra el porcentaje de **entregables completados** entre todos los proyectos (hospitales y PMO). Es un termómetro general, no una medida financiera.

### Editar y borrar (solo Owner)

Casi todo lo que se carga se puede corregir o eliminar. En cada fila hay dos iconos pequeños:

- **Lápiz (editar):** abre una ventana con los datos actuales. Cámbielos y pulse **"Save changes"**, o **"Cancel"** (o la tecla Esc) para salir sin cambiar nada.
- **Cubo de basura (borrar):** pide confirmación en dos pasos. Aparece **"Delete?"**; pulse **"Yes, delete"** para confirmar o **"Cancel"** para arrepentirse.

Se puede editar y borrar: hospitales, entregables, riesgos, dependencias, entradas de línea base, reuniones y to-dos. **Borrar es definitivo**: no hay papelera. Cada cambio queda en el registro de auditoría.

**Un hospital tiene una protección extra:** al borrarlo se eliminan también todos sus entregables, riesgos, dependencias y línea base, por eso la aplicación le pide **escribir el nombre exacto del hospital** antes de habilitar el borrado.

---

## 4. Portfolio (la pantalla de inicio)

Resumen de todo en una vista.

| Indicador | Qué cuenta |
|---|---|
| **Hospitals** | Hospitales registrados. |
| **Gates pending** | Puertas sin decisión, en todos los proyectos (incluido el PMO). |
| **Open risks** | Riesgos que no están cerrados. |
| **Overdue dependencies** | Dependencias externas con fecha vencida y que no se marcaron como hechas. |

Debajo:
- **To-Do:** sus próximos 5 pendientes. "All →" lleva al Calendar.
- **Upcoming meetings:** las próximas 5 reuniones.
- **Major issues:** riesgos abiertos de severidad High o Critical, con el hospital al que pertenecen. Los críticos tienen un latido rojo.
- **Active deliverables:** hasta 8 entregables sin completar. Haga clic en el nombre del hospital para ir a él.

---

## 5. Hospitals

### 5.1 Agregar un hospital

1. Pulse **"+ Add Hospital"** (arriba, junto a las pestañas).
2. Escriba el nombre y elija el **escenario** (obligatorio):

| Escenario | Significa | Cómo decidir |
|---|---|---|
| **A** | Hospital con farmacia operando | ¿Hay una farmacia funcionando hoy en el hospital? Sí → A. |
| **B** | Tiene un programa, pero no farmacia | No hay farmacia, pero sí un programa (inscripción 340B, programa ambulatorio, contrato de farmacia). → B |
| **C** | Se empieza desde cero | Ni farmacia ni programa. → C (incluye la decisión de inversión en el Gate 1). |

Si hay una farmacia pero le falta licencia, registro DEA o inscripción 340B, sigue siendo **A**, con un alcance regulatorio ampliado. Si el caso es ambiguo (farmacia cerrada temporalmente, licencias vencidas), usted decide junto con el farmacéutico de VitalBridge y lo documenta en el Gate 1.

3. Pulse "Create hospital". El hospital nace en la **fase 1** con cinco puertas (G1 a G5) pendientes.

Cada hospital aparece como una **pestaña** arriba. Si hay muchas, se desliza horizontalmente.

Junto al nombre del hospital están el **lápiz** (cambiar nombre o escenario) y el **cubo de basura** (eliminar el hospital, escribiendo su nombre).

### 5.2 Fases y puertas (gates)

Son 6 fases, y las puertas G1 a G5 se registran al cerrar las fases 1 a 5:

| Fase | Puerta al cerrarla |
|---|---|
| 1. Initial assessment | G1: Go / No-Go |
| 2. Governance | G2: línea base aprobada |
| 3. Operational readiness | G3: listo para operar |
| 4. Launch and stabilization | G4: operación estable |
| 5. Handover and closure | G5: aceptación y cierre |
| 6. Continuous improvement | (a nivel de programa, sin puerta) |

**Cómo registrar una decisión:**
1. En la tarjeta "Phases and gates" verá "Gate G*n* decision", donde *n* es la fase actual.
2. Elija en "Decision": **Go**, **Go with conditions**, **Re-plan** o **Stop**. Opcionalmente anote algo en "Notes".
3. Pulse "Record decision".

**Qué pasa:**
- **Go** o **Go with conditions** → el hospital **avanza a la fase siguiente**.
- **Re-plan** o **Stop** → se registra, pero el hospital **se queda en la misma fase**. Puede volver a decidir esa misma puerta más adelante.

Las fases completadas muestran una marca verde y la decisión tomada ("G1: Go").

### 5.3 Deliverables (entregables)

La tabla lista los entregables por fase, con responsable, estado y observaciones.

- **Agregar:** bajo la tabla, escriba "Deliverable name", elija la "Phase", opcionalmente el "Owner", y pulse "Add deliverable".
- **Cambiar el estado:** use el desplegable de la columna "Status": *Not started*, *In progress*, *Completed*, *Blocked*. Un entregable *Blocked* se muestra con una píldora roja con latido en el Portfolio y en la vista del Viewer; el Owner lo ve en el desplegable.

- **Editar:** el lápiz de la fila permite cambiar el nombre, la fase y el responsable, y además cargar el **"Document link"** (debe empezar con `http://` o `https://`) y las **"Remarks"** (observaciones). El enlace aparece como "Open" en la columna "Document".
- **Borrar:** el cubo de basura, con confirmación.

Los responsables se escriben con las siglas de los documentos: PM (Project Manager), VP (farmacéutico de VitalBridge), HL (líder del hospital), SC (comité directivo).

### 5.4 Baseline and fee (línea base y honorarios)

Es el corazón económico: VitalBridge cobra el **30% del beneficio bruto incremental** sobre una línea base acordada.

1. En "Baseline and fee" elija el **mes**, escriba el "Baseline ($)" (lo acordado) y el "Actual ($)" (lo real).
2. Pulse "Add entry". Solo hay **una entrada por mes**.

**Cómo se calcula**
- Para cada mes: diferencia = Actual − Baseline.
- Solo se suman los meses **por encima** de la línea base. Un mes malo **no resta** a los buenos.
- "Estimated fee (30%)" = 30% de ese total.

Ejemplo: mes 1 baseline 100 / actual 140 → +40. Mes 2 baseline 100 / actual 60 → no cuenta. Incremental = 40, honorarios = 12.

Es una **estimación de gestión**, no un documento contable. El gráfico muestra la línea real (continua) contra la base (punteada).

**Corregir una entrada:** con el lápiz cambia los importes de baseline y actual (el fee se recalcula al instante). El **mes no se puede cambiar**: si se equivocó de mes, borre la entrada (cubo de basura) y agréguela de nuevo.

### 5.5 Risks (riesgos)

- **Agregar:** "Risk title" + "Severity" (Low, Medium, High, Critical) → "Add risk".
- Los **High** y **Critical** abiertos aparecen en "Major issues" del Portfolio.
- **Cambiar o cerrar un riesgo:** lápiz → cambie la severidad, el responsable o el **"Status"** (*Open*, *Mitigating*, *Closed*). Un riesgo **Closed** aparece atenuado con la marca "(closed)" y **deja de contar** en "Open risks" y en "Major issues".
- Para eliminarlo del todo, use el cubo de basura.

### 5.6 External dependencies (dependencias externas)

Cosas que **no controla**: licencias, DEA, inscripción 340B, contratos con pagadores, acreditaciones.

- **Agregar:** "Dependency title", "Type", "Due date" → "Add dependency".
- **"Mark done"** la cierra. Si la fecha ya pasó y no está hecha, muestra **"Overdue"** en rojo.
- **Editar:** lápiz → título, tipo, fecha y estado (*Pending*, *In progress*, *Blocked*, *Done*). **Borrar:** cubo de basura.
- Aparecen también en el Calendar.

---

## 6. PMO

Es el **proyecto de construir la oficina de proyectos de VitalBridge**, según su Plan de Ejecución del PMO. Es distinto de un hospital: no tiene escenario ni línea base.

- **Primera vez:** si no existe, pulse **"Create PMO workstream"**. Crea las puertas G0 a G5.
- **PMO gates:** seis recuadros (G0 a G5), cada uno "Pending" o con su decisión. Para decidir: elija el "Gate", la "Decision", una nota opcional y pulse "Record decision". **Cada puerta es independiente**: aquí no hay fases que avancen.
  - **G0** es el mandato formal (el plan lo fija para el 18/12/2026): convierte el encargo en una autoridad por escrito.
  - **G1** cierra el diagnóstico; el **último** cierra con el traspaso a operación. Consulte el plan para el detalle de cada puerta.
- **Deliverables** y **Risks** funcionan igual que en un hospital. Úselos para las plantillas, procesos y reportes del PMO, y para riesgos como la falta de capacidad o el conflicto de ser juez y parte.

Es el tablero que puede mostrar a Ned y al sponsor para evidenciar cómo avanza el PMO.

---

## 7. Calendar (calendario, reuniones y to-dos)

Una sola pantalla para todo lo que tiene fecha, más la lista de pendientes.

### 7.1 La grilla mensual

- **Flechas** `<` `>` cambian de mes; **"Today"** vuelve al mes actual. La semana empieza el lunes.
- Cada día muestra hasta 3 eventos y "+N more" si hay más.
- Colores: **dorado** = vencimiento de dependencia · **rojo claro** = vencida · **burdeos** = reunión · **carbón** = to-do con fecha.
- Una **franja dorada** marca la ventana de inscripción **340B**: del 1 al 15 de enero, abril, julio y octubre. Pase el mouse sobre un día para verlo.
- El día de hoy tiene el número en círculo burdeos.

### 7.2 El panel de un día

Haga clic en cualquier día: a la derecha se abre su detalle, con la lista de eventos (y un enlace "Open" a la dependencia en su hospital).

**Solo Owner:** cada evento tiene su lápiz y su cubo de basura. Así puede cambiar la hora de una reunión, la fecha de un to-do o de una dependencia, o eliminarlos, sin salir del calendario.

**Solo Owner:** debajo aparecen tres pestañas para agregar en ese día:
- **Meeting:** título y hora ("Starts at", viene con las 9:00 del día elegido).
- **To-do:** título y "Due date" (viene con el día elegido; puede borrarla).
- **Dependency:** título, **Hospital**, tipo y fecha de vencimiento.

### 7.3 To-do (lista completa)

Muestra **todos** los pendientes, con o sin fecha (la grilla solo muestra los que tienen fecha).
- Marque la casilla para completarlo.
- Para agregar uno **sin fecha**, escriba en "New to-do, no date" y pulse "+".
- **"Completed (n)"** despliega los completados; desmarque uno para reabrirlo.
- Los vencidos muestran la fecha en rojo.

### 7.4 340B y plazos

- **340B registration window:** dice si la ventana está abierta ahora o cuándo abre.
- **Dependency deadlines:** las próximas dependencias abiertas, con las vencidas primero.

---

## 8. Flujos de trabajo sugeridos

**Primera semana (PMO)**
1. En **PMO**, pulse "Create PMO workstream".
2. Cargue como entregables los documentos clave del plan (Project Charter, carta de mandato…).
3. Cuando el sponsor firme el mandato, registre **G0 = Go**.
4. Anote riesgos propios del plan (capacidad, juez y parte).

**Llega un hospital nuevo**
1. **Hospitals → + Add Hospital**; clasifique el escenario A, B o C.
2. En la fase 1, cargue los entregables de evaluación inicial.
3. Cargue las **dependencias externas** que vayan a mandar el calendario (licencias, DEA, 340B) con su fecha.
4. Al terminar la evaluación, registre **G1**. Con "Go" pasa a la fase 2.
5. En la fase de gobernanza, cargue la **línea base** acordada; el G2 aprueba la línea base.
6. Cada mes, agregue la entrada de "Baseline and fee" con el real.

**Rutina semanal**
1. Abra **Portfolio**: mire los vencidos y los "Major issues".
2. Revise el **Calendar**: reuniones de la semana y vencimientos próximos.
3. Actualice los estados de los entregables.

---

## 9. Glosario

| Término | Significado |
|---|---|
| **Gate (puerta)** | Punto de decisión formal entre fases. Sin "Go", no se avanza. |
| **Escenario A/B/C** | Punto de partida del hospital: con farmacia / con programa sin farmacia / desde cero. |
| **Baseline (línea base)** | Resultado de referencia acordado. Solo lo que lo supera genera honorarios. |
| **Incremental gross profit** | Beneficio bruto por encima de la línea base. |
| **Fee** | 30% del beneficio bruto incremental. |
| **340B** | Programa federal de precios de medicamentos; las inscripciones nuevas solo se aceptan en las ventanas trimestrales. |
| **DEA** | Registro de la Drug Enforcement Administration, necesario para dispensar sustancias controladas. |
| **DSH** | Hospitales con alta proporción de pacientes de bajos ingresos, el cliente objetivo. |
| **Dependencia externa** | Algo que depende de un tercero y no del proyecto. |
| **Owner / Viewer** | Rol con permisos de edición / de solo lectura. |

---

## 10. Preguntas frecuentes

**No veo ningún botón para agregar o editar.** Está con un usuario Viewer. Solo el Owner puede modificar.

**El Portfolio muestra todo en 0.** Es normal al empezar: aún no hay datos. Cargue el PMO y su primer hospital.

**La primera pantalla tarda en cargar después de un rato sin usar.** El servidor "se duerme" por inactividad y tarda en despertar la primera vez (hasta uno o dos segundos). Las siguientes son rápidas.

**Olvidé mi contraseña.** Use "Forgot password?" en la pantalla de inicio (ver "Contraseña y recuperación de acceso"). Si el correo no llega a un usuario, el administrador (usted) puede restablecerla desde el panel de Supabase (Authentication → Users).

**Perdí el teléfono con el código TOTP.** Use uno de sus **códigos de recuperación** (ver "Contraseña y recuperación de acceso"). Alternativas si no los guardó: la clave secreta que anotó al activar el MFA sirve para configurarlo en otro teléfono; y como administrador del proyecto puede eliminar el factor desde el panel de Supabase (Authentication → Users) para volver a enrolarse. **Genere sus códigos hoy mismo**, antes de necesitarlos.

**No me llega el correo de recuperación.** El servicio de correo gratuito de Supabase **solo entrega a los miembros de su organización** (es decir, a usted) y limita el número de envíos por hora. Para que funcione con otros usuarios, como Ned, hay que configurar un servicio de correo propio (SMTP). Mientras tanto, usted puede restablecer su contraseña desde el panel de Supabase.

**Las horas de las reuniones.** Se muestran en la zona horaria del servidor (UTC en producción), la misma en que se escriben: lo que usted teclea es lo que ve. Hay una consecuencia: el cambio de "hoy" ocurre a medianoche UTC, que en UTC−4 (hora del Atlántico) es a las 8:00 p. m.

---

## 11. Lo que todavía no se puede hacer

Conviene conocerlo para no perder tiempo buscándolo:

- **Deshacer un borrado.** No hay papelera: lo borrado se pierde (queda solo la huella en el registro de auditoría).
- **Editar las decisiones de las puertas ya superadas.** Una decisión se registra de nuevo solo mientras la puerta sigue siendo la actual; las anteriores no se reabren.
- **Cambiar el mes de una entrada de línea base.** Se borra y se vuelve a cargar.
- **Recuperar la contraseña de otras personas por correo sin un SMTP propio** (ver las preguntas frecuentes).
- **Activar la verificación en dos pasos por su cuenta si es Viewer**, o quitarla desde la aplicación sin un código de recuperación.
- **Exportar** a Excel o PowerPoint, ni integrarse con Asana, Jira, Teams u Outlook.
- **Comandos de voz** o asistente de IA (previstos como una fase posterior).
- Crear usuarios nuevos: se hace desde el panel de Supabase.
