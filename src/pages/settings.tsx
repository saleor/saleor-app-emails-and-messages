import { Navigation } from "../components/navigation";

const SettingsPage = () => {
  const sendEmail = async () => {
    await fetch("/api/sendEmail", { method: "POST" });
  };

  return (
    <>
      <Navigation />
      <div>
        <button onClick={sendEmail}>Send email</button>
      </div>
    </>
  );
};

export default SettingsPage;
