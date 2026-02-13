export interface Problem {
    id: string;
    label: string;
    description: string;
    treatments: string[];
    position: { x: number; y: number };
}

export interface SavedDiagnosis {
    problemId: string;
    label: string;
    selectedTreatments: string[];
    scheduledTime?: string;
}

export const PROBLEMS: Problem[] = [
    {
        id: "pieds",
        label: "Pieds",
        description:
            "Sensibilité excessive détectée au niveau des pieds. Une détente bien-être est de rigueur.",
        treatments: ["Pédicure", "Fish pédicure", "Papouilles"],
        position: { x: 52, y: 97 },
    },
    {
        id: "ventre",
        label: "Ventre",
        description:
            "Tension abdominale nécessitant une attention particulière. Les experts recommandent le tout premier repas partagé ensemble.",
        treatments: ["Probiotique", "Repas", "Pet"],
        position: { x: 51, y: 43 },
    },
    {
        id: "main",
        label: "Main",
        description:
            "Carence affective détectée au niveau de la main. Y ajouter quelque chose pourrait régler le problème.",
        treatments: ["Fleur", "Bague de mariage"],
        position: { x: 24, y: 54 },
    },
    {
        id: "dos",
        label: "Dos",
        description:
            "Tensions musculaires détectées dans la zone dorsale. Un problème récurrent chez les personnes ayant un dos aussi développé.",
        treatments: ["Massage", "Étirements"],
        position: { x: 62, y: 34 },
    },
    {
        id: "bouche",
        label: "Bouche",
        description: "Déficit d'affection buccale constaté. Elles ne vont pas s'en tirer comme ça.",
        treatments: ["Baiser", "Rouge à lèvres", "Baume à lèvres"],
        position: { x: 50, y: 11 },
    },
    {
        id: "visage",
        label: "Peau du visage",
        description:
            "Qualité de peau nécessitant un traitement spécifique. Avoir une belle beau est un privilège qu'il faut entretenir.",
        treatments: ["Soin de la peau"],
        position: { x: 44, y: 8 },
    },
    {
        id: "parties",
        label: "Parties génitales",
        description: "Zone nécessitant une stimulation thérapeutique",
        treatments: ["Orgasme (masturbation)", "Orgasme (cunnilingus)", "Orgasme (rapport)"],
        position: { x: 50, y: 49 },
    },
];
