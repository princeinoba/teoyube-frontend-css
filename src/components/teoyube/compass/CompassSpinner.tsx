export default function CompassSpinner({
  message = "Loading TeoyubeWorld videos..."
}: {
  message?: string;
}) {
  return (
    <div className="compass-spinner">
      <div className="spinner-ring" />
      <p className="muted">{message}</p>
    </div>
  );
}
