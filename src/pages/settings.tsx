import { Navigation } from "../components/navigation";

import { MJML_DEFAULT_TEMPLATE } from "../consts";

const SettingsPage = () => {
  const sendEmail = async () => {
    console.log("PARSE!");

    const parseResponse = await fetch("/api/parseMjml", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mjml: MJML_DEFAULT_TEMPLATE }),
    });

    const response = await parseResponse.json();

    const compileResponse = await fetch("/api/compileTemplates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: response.rawHtml,
        // TODO: remove fake data
        variables: {
          order: {
            order_details_url: "https://saleor.io",
          },
        },
      }),
    });

    const handlebarsResponse = await compileResponse.json();

    await fetch("/api/sendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        htmlPart: handlebarsResponse.compiledHTMLTemplate,
        textPart: handlebarsResponse.compiledPlaintextTemplate,
        from: "Saleor Mailing Bot <mail@saleor.io>",
        to: "test@user.com",
        subject: "Welcome to Saleor Mail",
      }),
    });
  };

  return (
    <>
      <Navigation />
      <div>
        {/* TODO: remove sendEmail test function */}
        <button onClick={sendEmail}>Send email</button>
      </div>
    </>
  );
};

export default SettingsPage;
