"""
System prompt para el asistente IA de Thalassa.

Especializado en acuariofilia marina de nivel intermedio-avanzado.
Se inyecta como system message en cada llamada al LLM (Groq / Llama 3.3).
"""

SYSTEM_PROMPT = """
You are Thalassa AI, an expert marine aquarium assistant built into the Thalassa
platform. Your role is to help marine aquarists — from beginners to advanced reef
keepers — manage their tanks, solve problems, and optimize their systems.

## Your expertise covers:

**Water Chemistry & Parameters**
- Calcium (Ca): optimal 380–450 ppm
- Alkalinity (KH/dKH): optimal 7–11 dKH
- Magnesium (Mg): optimal 1250–1400 ppm
- pH: optimal 8.0–8.4
- Salinity: optimal 1.023–1.026 SG
- Nitrates (NO3): optimal 0–10 ppm
- Phosphates (PO4): optimal 0.00–0.10 ppm
- Temperature: optimal 24.0–26.5 °C
- Interpreting test results and recommending corrective action

**Livestock & Compatibility**
- Fish, coral, and invertebrate care requirements
- Reef-safe vs. non-reef-safe species (always flag incompatibilities clearly)
- Aggression levels, minimum tank size, and tank mate compatibility
- Feeding schedules, diet, and acclimation procedures
- Common diseases: ich (Cryptocaryon), velvet (Amyloodinium), HLLE, AEFW, flatworms, RTN/STN

**Corals & Reef Biology**
- LPS, SPS, and soft coral care differences
- Lighting requirements (PAR/PUR ranges per coral type)
- Flow requirements and placement in the tank
- Fragging techniques and coral propagation

**Equipment & Technical**
- Protein skimmers, refugiums, sumps, and reactors
- LED, T5, and metal halide lighting comparison
- Return pumps, wavemakers, and flow patterns
- Calcium reactors, kalkwasser, two-part dosing
- RO/DI systems and water preparation
- Quarantine tank setup and fish-in cycling

**Troubleshooting**
- Algae problems: dinoflagellates, cyanobacteria, bubble algae, hair algae
- Cloudy water, ammonia spikes, and mini-cycles
- Coral bleaching, STN/RTN diagnosis and intervention
- Equipment failures and emergency procedures
- New tank syndrome and nitrogen cycle management

**Dosing & Calculations**
- Two-part dosing (calcium chloride + sodium bicarbonate/soda ash)
- Kalkwasser (calcium hydroxide) — benefits and risks
- Magnesium supplementation (magnesium chloride and sulfate)
- Dose calculation formulas for target parameter adjustments

## How you respond:

1. **Be specific and actionable.** Do not give vague advice. Give exact amounts,
   specific product names, and step-by-step instructions when applicable.

2. **Use the aquarium context when provided.** If the user shares their current
   parameters, livestock, or tank volume, tailor your advice precisely to their
   situation. Reference their specific values in your response. Flag any parameter
   that is outside the optimal range.

3. **Flag safety concerns clearly.** If a species is NOT reef-safe, a parameter
   is critically out of range, or a chemical interaction is dangerous, say so
   explicitly using bold text or a warning prefix like "⚠️ WARNING:".

4. **Admit uncertainty honestly.** If you are unsure about something, say so.
   Do not fabricate scientific data, species information, or product specs.

5. **Match the user's language.** Respond in the same language the user writes in
   (Spanish, English, German, etc.).

6. **Keep responses concise but complete.** Avoid unnecessary padding. Use bullet
   points or numbered lists for multi-step instructions. Use headers for longer
   responses covering multiple topics.

7. **Prioritize livestock safety.** When in doubt, always err on the side of
   caution for the health of the animals.
"""


def _format_livestock(items: list[dict]) -> str:
    parts = []
    for item in items[:12]:
        name = item.get("name", "Unknown")
        qty = item.get("quantity")
        category = item.get("category", "")
        reef_safe = item.get("reefSafe")

        line = f"  • {name}"
        if qty and qty > 1:
            line += f" (×{qty})"
        if category:
            line += f" [{category}]"
        if reef_safe is False:
            line += " ⚠️ NOT reef-safe"
        parts.append(line)
    return "\n".join(parts)


def _format_equipment(items: list[dict]) -> str:
    parts = []
    for item in items[:10]:
        name = item.get("name", "Unknown")
        category = item.get("category", "")
        watts = item.get("powerWatts")
        hours = item.get("hoursPerDay")

        line = f"  • {name}"
        if category:
            line += f" [{category}]"
        if watts is not None and hours is not None:
            line += f" — {watts}W × {hours}h/day"
        elif watts is not None:
            line += f" — {watts}W"
        parts.append(line)
    return "\n".join(parts)


def _format_parameters(params: dict) -> str:
    def _val(key: str, unit: str) -> str | None:
        v = params.get(key)
        return f"{v} {unit}" if v is not None else None

    lines = []
    mappings = [
        ("ph",          "pH",          ""),
        ("salinity",    "Salinity",    "ppt"),
        ("temperature", "Temperature", "°C"),
        ("alkalinity",  "Alkalinity",  "dKH"),
        ("calcium",     "Calcium",     "ppm"),
        ("magnesium",   "Magnesium",   "ppm"),
        ("nitrates",    "Nitrates",    "ppm"),
        ("phosphates",  "Phosphates",  "ppm"),
    ]
    for key, label, unit in mappings:
        v = params.get(key)
        if v is None:
            continue
        display = f"{v} {unit}".strip() if unit else str(v)
        lines.append(f"  • {label}: {display}")

    measured = params.get("measuredAt")
    if measured:
        # Show only the date part for brevity
        date_part = str(measured)[:10]
        lines.append(f"  • Last tested: {date_part}")

    return "\n".join(lines)


def build_user_prompt(message: str, aquarium_context: dict | None = None) -> str:
    """
    Construye el mensaje del usuario incluyendo el contexto completo del acuario
    cuando está disponible: parámetros de agua, fauna, equipo y datos básicos del tanque.
    """
    if not aquarium_context:
        return message

    sections: list[str] = ["[Aquarium context from the user's Thalassa account]"]

    # ── Basic tank info ───────────────────────────────────────────────────────
    if name := aquarium_context.get("name"):
        sections.append(f"Tank name: {name}")

    if liters := aquarium_context.get("liters"):
        sections.append(f"Volume: {liters} L")

    if tank_type := aquarium_context.get("type"):
        readable = {
            "MARINO_ARRECIFE": "Marine Reef",
            "MARINO_PECES":    "Marine Fish-Only",
        }.get(tank_type, tank_type)
        sections.append(f"Type: {readable}")

    # ── Water parameters ──────────────────────────────────────────────────────
    params = aquarium_context.get("waterParameters") or aquarium_context.get("parameters")
    if params and isinstance(params, dict):
        param_block = _format_parameters(params)
        if param_block:
            sections.append(f"Current water parameters:\n{param_block}")

    # ── Livestock ─────────────────────────────────────────────────────────────
    livestock = aquarium_context.get("livestock")
    if livestock and isinstance(livestock, list):
        ls_block = _format_livestock(livestock)
        if ls_block:
            sections.append(f"Livestock ({len(livestock)} entries):\n{ls_block}")

    # ── Equipment ─────────────────────────────────────────────────────────────
    equipment = aquarium_context.get("equipment")
    if equipment and isinstance(equipment, list):
        eq_block = _format_equipment(equipment)
        if eq_block:
            sections.append(f"Equipment ({len(equipment)} items):\n{eq_block}")

    context_block = "\n\n".join(sections)
    return f"{context_block}\n\nUser question: {message}"
