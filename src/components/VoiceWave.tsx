export function VoiceWave({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="voice-wave" aria-label="AI 正在朗读">
      <span />
      <span />
      <span />
    </div>
  );
}
