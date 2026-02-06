import React from "react";
import {
  Activity,
  Heart,
  Brain,
  Eye,
  UserX,
  Stethoscope,
  ShieldAlert,
  Skull,
  Microscope,
  Radiation,
  Syringe,
  Bone,
  BriefcaseMedical,
  Pill,
} from "lucide-react";

// Disease List Data
const DISEASES = [
  { name: "Neoplasia Maligna (Câncer)", icon: <Microscope size={24} /> },
  { name: "Cardiopatia Grave", icon: <Heart size={24} /> },
  { name: "Doença de Parkinson", icon: <Brain size={24} /> },
  { name: "Alienação Mental", icon: <UserX size={24} /> },
  { name: "Esclerose Múltipla", icon: <Activity size={24} /> },
  { name: "Cegueira (Inclusive Monocular)", icon: <Eye size={24} /> },
  {
    name: "Paralisia Irreversível e Incapacitante",
    icon: <AccessibilityIcon />,
  },
  { name: "Nefropatia Grave", icon: <Stethoscope size={24} /> },
  { name: "Tuberculose Ativa", icon: <ShieldAlert size={24} /> },
  { name: "Hanseníase", icon: <PillIcon /> },
  { name: "AIDS (HIV)", icon: <Syringe size={24} /> },
  { name: "Contaminação por Radiação", icon: <Radiation size={24} /> },
  { name: "Hepatopatia Grave", icon: <Activity size={24} /> },
  { name: "Espondiloartrose Anquilosante", icon: <Bone size={24} /> },
  { name: "Osteíte Deformante", icon: <Bone size={24} /> },
  { name: "Moléstia Profissional", icon: <BriefcaseMedical size={24} /> },
  { name: "Fibrose Cística", icon: <Pill size={24} /> },
];

function AccessibilityIcon() {
  return <Activity size={24} />;
}
function PillIcon() {
  return <Pill size={24} />;
} // Fixed lowerCamelCase

const DiseasesList: React.FC = () => {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-vinho-500 font-bold tracking-wider text-sm uppercase mb-2 block">
            Lei 7.713/88
          </span>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-vinho-500 mb-6">
            Doenças que dão direito à Isenção
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Confira a lista das 17 patologias que garantem o direito à isenção
            do Imposto de Renda segundo a legislação atual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DISEASES.map((disease, idx) => (
            <div
              key={idx}
              className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-vinho-500/50 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-start gap-4 group"
            >
              <div className="bg-vinho-500/10 p-2 rounded-lg text-vinho-500 shrink-0 group-hover:bg-vinho-500 group-hover:text-white transition-colors">
                {disease.icon}
              </div>
              <span className="font-semibold text-gray-900 leading-tight self-center">
                {disease.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 italic">
            * Lista conforme Lei nº 7.713/88. Outras doenças podem ser incluídas
            mediante análise judicial.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiseasesList;
