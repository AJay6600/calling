export const AGENT_LANGUAGE_LABELS: Record<string, string> = {
  english: 'English',
  hindi: 'Hindi',
  marathi: 'Marathi',
};

export enum AgentLanguageLabelEnum {
  english = 'English',
  hindi = 'Hindi',
  marathi = 'Marathi',
}

export const getLanguageLabel = (languageId?: string | null): string => {
  if (!languageId) return '';
  return (
    AGENT_LANGUAGE_LABELS[languageId.toLowerCase()] ??
    languageId.charAt(0).toUpperCase() + languageId.slice(1)
  );
};
