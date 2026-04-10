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

METHOD_CATEGORIES = [
    "Spinning",
    "Fly Fishing",
    "Bait Fishing",
    "Trolling",
    "Vertical Fishing",
    "Pole Fishing",
    "Other",
]


def normalize_species(species: str) -> str:
    normalized = species.strip()

    for option in SPECIES_OPTIONS:
        if option.casefold() == normalized.casefold():
            return option

    raise ValueError("Species must be selected from the supported species list")


def normalize_method_category(method_category: str) -> str:
    normalized = method_category.strip()

    for option in METHOD_CATEGORIES:
        if option.casefold() == normalized.casefold():
            return option

    raise ValueError("Method category must be selected from the supported categories list")
