# Deus Ex Ludus

A d100 target number system for FoundryVTT, by FoxMaid Games. Currently in beta.

## System Overview

Deus Ex Ludus is a tabletop RPG system using a d100 (percentile) die with a target number mechanic. Players roll against their attributes and skills to determine success or failure, with degrees of success or failure based on how far the roll deviates from the target number.

### Degrees of Success and Failure

- **Success**: If the roll is less than or equal to the target number, the action succeeds.
  - Degrees of success = floor((target number - roll) / 10) + 1
- **Failure**: If the roll exceeds the target number, the action fails.
  - Degrees of failure = floor((roll - target number) / 10) + 1

### Attributes

Characters have six attributes, each with a value from 1 to 100:

- Strength (str)
- Dexterity (dex)
- Constitution (con)
- Intelligence (int)
- Wisdom (wis)
- Charisma (cha)

### Skills

Skills are associated with an attribute and provide a bonus to the roll. The target number for a skill check is attribute value + skill bonus.

### Installation

1. Download the system files.
2. Place the `deus-ex-ludus` folder in your FoundryVTT `Data/systems` directory.
3. Restart FoundryVTT.
4. Create a new world using the "Deus Ex Ludus" system.

## License

This system is in beta and provided as-is.