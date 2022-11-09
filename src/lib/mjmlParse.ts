const parseMjml = async (emailTemplate: string) => {
  const response = await fetch("/api/parseMjml", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mjml: emailTemplate }),
  });

  const res = await response.json();

  return res;
};

export default parseMjml;
