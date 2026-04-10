SPECIES_OPTIONS = [
    "Perch",
    "Pike",
    "Zander",
    "Roach",
    "Bream",
    "Carp",
    "Tench",
    "European Eel",
    "Sea Bass",
    "Sea Trout",
    "Atlantic Cod",
    "Flounder",
    "Plaice",
    "Mackerel",
    "Herring",
]


def normalize_species(species: str) -> str:
    normalized = species.strip()

    for option in SPECIES_OPTIONS:
        if option.casefold() == normalized.casefold():
            return option

    raise ValueError("Species must be selected from the supported species list")
