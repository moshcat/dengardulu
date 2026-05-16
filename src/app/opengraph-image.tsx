import { ImageResponse } from "next/og";

export const alt = "DengarDulu — AI Voice-Scam Shield for Malaysia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const sofiaSansBold = await fetch(
    "https://fonts.gstatic.com/s/sofiasans/v20/Yq6E-LCVXSLy9uPBwlAThu1SY8Cx8rlT69Cdt63t.ttf"
  ).then((res) => res.arrayBuffer());

  const sofiaSansRegular = await fetch(
    "https://fonts.gstatic.com/s/sofiasans/v20/Yq6E-LCVXSLy9uPBwlAThu1SY8Cx8rlT69B6sK3t.ttf"
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F3F0EE",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative orbital arc — top right */}
        <div
          style={{
            position: "absolute",
            top: "-180px",
            right: "-120px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            border: "3px solid #F37338",
            opacity: 0.35,
            display: "flex",
          }}
        />

        {/* Decorative orbital arc — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-220px",
            left: "-100px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            border: "2px solid #F37338",
            opacity: 0.2,
            display: "flex",
          }}
        />

        {/* Small accent circle */}
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "80px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#F37338",
            display: "flex",
          }}
        />

        {/* Content container — pill shape */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 80px",
            borderRadius: "40px",
            backgroundColor: "#FCFBFA",
            boxShadow: "0 24px 48px rgba(0,0,0,0.06)",
            maxWidth: "920px",
          }}
        >
          {/* App name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#141413",
              letterSpacing: "-1.44px",
              lineHeight: 1,
              fontFamily: "Sofia Sans",
              display: "flex",
            }}
          >
            DengarDulu
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "#696969",
              marginTop: "16px",
              letterSpacing: "-0.28px",
              fontFamily: "Sofia Sans",
              display: "flex",
            }}
          >
            Dengar Dulu. Jawab Kemudian.
          </div>

          {/* Orange divider pill */}
          <div
            style={{
              width: "80px",
              height: "5px",
              borderRadius: "999px",
              backgroundColor: "#F37338",
              marginTop: "28px",
              display: "flex",
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: "#555555",
              marginTop: "28px",
              fontFamily: "Sofia Sans",
              display: "flex",
              textAlign: "center",
            }}
          >
            AI Voice-Scam Shield for Malaysia
          </div>
        </div>

        {/* Bottom eyebrow */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#F37338",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#696969",
              letterSpacing: "0.56px",
              textTransform: "uppercase",
              fontFamily: "Sofia Sans",
              display: "flex",
            }}
          >
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Sofia Sans",
          data: sofiaSansBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Sofia Sans",
          data: sofiaSansRegular,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
