"use client";

import { forwardRef } from "react";

// The certificate always renders on light "parchment" with navy + gold accents
// (matching the printed design) regardless of the site theme. Every colour is
// an explicit hex value so html2canvas-pro can rasterise it faithfully.
const NAVY = "#0a1f44";
const GOLD = "#c9a227";
const GOLD_LIGHT = "#e6c66b";
const CREAM = "#f7f2e5";
const INK = "#20304f";

const SERIF = "Georgia, 'Times New Roman', serif";
const SCRIPT = "'Segoe Script', 'Brush Script MT', 'Snell Roundhand', cursive";

function Seal({ lines }: { lines: string[] }) {
  return (
    <div
      style={{
        width: 104,
        height: 104,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, ${NAVY}, #071630)`,
        border: `3px solid ${GOLD}`,
        boxShadow: `0 0 0 4px ${CREAM}, 0 0 0 5px ${GOLD}, 0 6px 16px rgba(0,0,0,.25)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 8,
      }}
    >
      {lines.map((l) => (
        <span
          key={l}
          style={{
            color: GOLD_LIGHT,
            fontSize: 9,
            lineHeight: 1.4,
            letterSpacing: 1,
            fontWeight: 700,
            textTransform: "uppercase",
            fontFamily: SERIF,
          }}
        >
          {l}
        </span>
      ))}
      <span style={{ color: GOLD, fontSize: 10, marginTop: 2 }}>★ ★ ★</span>
    </div>
  );
}

export interface CertificateData {
  recipient: string;
  bookTitle: string;
  bookAuthor: string;
  score?: number;
  date: string;
}

export const CertificateCard = forwardRef<HTMLDivElement, { data: CertificateData }>(
  function CertificateCard({ data }, ref) {
    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.4 / 1",
          background: `linear-gradient(135deg, ${CREAM}, #efe7d1)`,
          color: INK,
          fontFamily: SERIF,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,.4)",
        }}
      >
        {/* navy + gold frame */}
        <div style={{ position: "absolute", inset: 0, border: `14px solid ${NAVY}` }} />
        <div style={{ position: "absolute", inset: 18, border: `2px solid ${GOLD}` }} />

        {/* gold corner ribbons (top-right, bottom-left) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderTop: `90px solid ${GOLD}`,
            borderLeft: "90px solid transparent",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 0,
            height: 0,
            borderBottom: `90px solid ${GOLD}`,
            borderRight: "90px solid transparent",
          }}
        />

        {/* left accolade seal */}
        <div style={{ position: "absolute", left: 40, top: 70, zIndex: 2 }}>
          <Seal lines={["Knowledge", "Curiosity", "Growth"]} />
        </div>

        {/* content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "6% 12% 4%",
            textAlign: "center",
          }}
        >
          {/* crest */}
          <div style={{ position: "relative", marginBottom: 4 }}>
            <span
              style={{
                position: "absolute",
                top: -20,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 22,
                color: GOLD,
              }}
            >
              ♛
            </span>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "#fff",
                border: `3px solid ${GOLD}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 0 4px ${NAVY}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bookbee-logo-full.svg" alt="BookBee" width={46} height={46} />
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: NAVY,
              letterSpacing: 0.5,
              marginTop: 6,
            }}
          >
            BookBee
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0 2px" }}>
            <span style={{ width: 40, height: 1, background: GOLD }} />
            <span style={{ color: GOLD, fontSize: 10 }}>◆</span>
            <span style={{ width: 40, height: 1, background: GOLD }} />
          </div>

          <div
            style={{
              fontSize: "min(6vw, 52px)",
              fontWeight: 700,
              letterSpacing: 4,
              color: GOLD,
              lineHeight: 1,
              textShadow: "0 1px 0 rgba(0,0,0,.06)",
            }}
          >
            CERTIFICATE
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 6,
              color: NAVY,
              marginTop: 4,
            }}
          >
            OF ACHIEVEMENT
          </div>

          <div
            style={{
              fontSize: 11,
              letterSpacing: 2,
              color: INK,
              marginTop: 16,
              textTransform: "uppercase",
            }}
          >
            This certificate is proudly presented to
          </div>

          <div
            style={{
              fontFamily: SCRIPT,
              fontSize: "min(6vw, 46px)",
              color: GOLD,
              margin: "6px 0 2px",
              lineHeight: 1.1,
            }}
          >
            {data.recipient}
          </div>
          <div style={{ width: "60%", height: 1, background: `${NAVY}55`, marginBottom: 12 }} />

          <p
            style={{
              fontSize: 12.5,
              lineHeight: 1.7,
              color: INK,
              maxWidth: "80%",
              margin: 0,
            }}
          >
            for successfully answering questions from{" "}
            <strong style={{ color: NAVY }}>“{data.bookTitle}”</strong> by {data.bookAuthor} on{" "}
            <strong style={{ color: NAVY }}>BookBee</strong>
            {typeof data.score === "number" ? ` with a score of ${data.score}/10` : ""},
            demonstrating excellent comprehension, curiosity, and dedication to learning.
          </p>

          {/* footer */}
          <div
            style={{
              marginTop: "auto",
              width: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ textAlign: "center", minWidth: 150 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 26, color: NAVY, lineHeight: 1 }}>
                Behruz Uktamov
              </div>
              <div style={{ height: 1, background: `${NAVY}66`, margin: "4px 0 6px" }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>Behruz Uktamov</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, textTransform: "uppercase" }}>
                Founder &amp; CEO BookBee
              </div>
            </div>

            <Seal lines={["Comprehension", "Excellence"]} />

            <div style={{ textAlign: "center", minWidth: 150 }}>
              <div style={{ fontSize: 18, color: NAVY, fontWeight: 600 }}>{data.date}</div>
              <div style={{ height: 1, background: `${NAVY}66`, margin: "4px 0 6px" }} />
              <div style={{ fontSize: 9, letterSpacing: 2, color: GOLD, textTransform: "uppercase" }}>
                Date
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
