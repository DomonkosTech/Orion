import React, { useEffect, useMemo, useState } from "react";
import {type ChatPartner,type Message, getChatPartners, getMessagesForCompany } from "../../../Api/messageApi.ts";

const containerStyle: React.CSSProperties = {
  display: "flex",
  height: "100%",
  minHeight: 500,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  overflow: "hidden",
  background: "#fff",
};

const sidebarStyle: React.CSSProperties = {
  width: 280,
  borderRight: "1px solid #e5e7eb",
  overflowY: "auto",
  background: "#fafafa",
};

const sidebarHeaderStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
};

const partnerItemStyle: React.CSSProperties = {
  padding: "12px 16px",
  cursor: "pointer",
  borderBottom: "1px solid #f0f0f0",
};

const activePartnerItemStyle: React.CSSProperties = {
  ...partnerItemStyle,
  background: "#eef2ff",
};

const chatPaneStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
};

const chatHeaderStyle: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
};

const messagesContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: 16,
  background: "#f9fafb",
};

const inputBarStyle: React.CSSProperties = {
  padding: 12,
  borderTop: "1px solid #e5e7eb",
  display: "flex",
  gap: 8,
  background: "#fff",
};

const bubbleRowStyle: React.CSSProperties = {
  display: "flex",
  marginBottom: 8,
};

const userBubbleStyle: React.CSSProperties = {
  marginLeft: "auto",
  background: "#4f46e5",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 12,
  maxWidth: "70%",
  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  whiteSpace: "pre-wrap",
};

const companyBubbleStyle: React.CSSProperties = {
  marginRight: "auto",
  background: "#e5e7eb",
  color: "#111827",
  padding: "8px 12px",
  borderRadius: 12,
  maxWidth: "70%",
  boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  whiteSpace: "pre-wrap",
};

const smallMutedStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
};

// Segéd: kezdőbetűk (első két betű) a cégnévből
function getInitials(name?: string) {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const letters = trimmed
    .split(/\s+/)
    .map((s) => s[0])
    .join("");
  const take = (letters || trimmed).slice(0, 2);
  return take.toUpperCase();
}

// Egységes kör avatar stílus (lista és buborékok mellett)
const avatarStyleBase: React.CSSProperties = {
  width: 36,
  height: 36,
  minWidth: 36,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 0.5,
  color: "#fff",
  background: "#6366f1",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.15)",
};

// Kisebb avatar a felhasználói üzenetek olvasottsági jelzéséhez
const smallAvatarStyle: React.CSSProperties = {
  ...avatarStyleBase,
  width: 20,
  height: 20,
  minWidth: 20,
  fontSize: 9,
  fontWeight: 800,
  boxShadow: "0 0 0 2px #fff",
};

function formatDateTime(value?: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

const Messenger: React.FC = () => {
  const [partners, setPartners] = useState<ChatPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState<string | null>(null);

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const selectedCompany = useMemo(
    () => partners.find((p) => p.company_id === selectedCompanyId) ?? null,
    [partners, selectedCompanyId]
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Utolsó olvasott felhasználói üzenet kiszámítása (csak ez kap zöld fej ikont)
  const lastReadUserMessageId = useMemo(() => {
    const readUserMessages = messages.filter(
      (m) => m.sender_type === "USER" && m.is_read
    );
    if (readUserMessages.length === 0) return null as number | null;
    // Válasszuk ki a legkésőbbi created_at dátumú olvasott USER üzenetet
    const last = readUserMessages.reduce((acc, cur) =>
      new Date(cur.created_at).getTime() > new Date(acc.created_at).getTime()
        ? cur
        : acc
    );
    return last.id;
  }, [messages]);

  // Fetch chat partners on mount
  useEffect(() => {
    let cancelled = false;
    async function loadPartners() {
      setPartnersLoading(true);
      setPartnersError(null);
      try {
        const json = await getChatPartners();
        const data: ChatPartner[] = json?.data ?? [];
        if (!cancelled) {
          setPartners(data);
          // Auto-select first partner
          if (data.length > 0) setSelectedCompanyId((prev) => prev ?? data[0].company_id);
        }
      } catch  {
        if (!cancelled) setPartnersError("hiba történt");
      } finally {
        if (!cancelled) setPartnersLoading(false);
      }
    }
    loadPartners();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch messages when a company is selected
  useEffect(() => {
    if (!selectedCompanyId) return;
    let cancelled = false;
    async function loadMessages() {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        // selectedCompanyId is guaranteed to be number here because of the check above
        const json = await getMessagesForCompany(selectedCompanyId!);
        const data: Message[] = json?.data ?? [];
        if (!cancelled) setMessages(data);
      } catch  {
        if (!cancelled) setMessagesError("Ismeretlen hiba történt");
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    }
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [selectedCompanyId]);

  const renderPartner = (p: ChatPartner) => {
    const active = p.company_id === selectedCompanyId;
    const initials = getInitials(p.company_name);
    return (
      <div
        key={p.company_id}
        style={{ ...(active ? activePartnerItemStyle : partnerItemStyle), display: "flex", gap: 12, alignItems: "center" }}
        onClick={() => setSelectedCompanyId(p.company_id)}
      >
        <div style={avatarStyleBase}>{initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.company_name}</div>
          <div style={smallMutedStyle}>{formatDateTime(p.last_message_at)}</div>
        </div>
      </div>
    );
  };

  const getMessageText = (m: Message) => m.content ?? m.message ?? "";

  return (
    <div style={containerStyle}>
      {/* Sidebar: partnerek */}
      <aside style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>Beszélgetések</div>
        {partnersLoading && (
          <div style={{ padding: 16 }}>Partnerek betöltése…</div>
        )}
        {partnersError && (
          <div style={{ padding: 16, color: "#b91c1c" }}>{partnersError}</div>
        )}
        {!partnersLoading && !partnersError && partners.length === 0 && (
          <div style={{ padding: 16, color: "#6b7280" }}>
            Még nincs beszélgetés.
          </div>
        )}
        {partners.map(renderPartner)}
      </aside>

      {/* Chat fő nézet */}
      <section style={chatPaneStyle}>
        <div style={chatHeaderStyle}>
          {selectedCompany ? selectedCompany.company_name : "Válassz egy beszélgetést"}
        </div>
        <div style={messagesContainerStyle}>
          {!selectedCompany && (
            <div style={{ color: "#6b7280" }}>Bal oldalt válassz céget a chat megnyitásához.</div>
          )}
          {selectedCompany && messagesLoading && (
            <div>Üzenetek betöltése…</div>
          )}
          {selectedCompany && messagesError && (
            <div style={{ color: "#b91c1c" }}>{messagesError}</div>
          )}
          {selectedCompany && !messagesLoading && !messagesError && (
            <div>
              {messages.length === 0 ? (
                <div style={{ color: "#6b7280" }}>Nincsenek üzenetek.</div>
              ) : (
                messages.map((m) => {
                  const isUser = m.sender_type === "USER";
                  const text = getMessageText(m);
                  const initials = getInitials(selectedCompany?.company_name);
                  return (
                    <div key={m.id} style={{ ...bubbleRowStyle, alignItems: "flex-end", gap: 8, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                      {/* CÉG üzenet: balra avatar */}
                      {!isUser && <div style={avatarStyleBase} title={selectedCompany?.company_name}>{initials}</div>}

                      <div style={isUser ? userBubbleStyle : companyBubbleStyle}>
                        <div>{text}</div>
                        <div style={{ ...smallMutedStyle, marginTop: 4 }}>
                          {formatDateTime(m.created_at)}
                        </div>
                      </div>

                      {/* USER üzenet: csak az utolsó olvasott mellett jelenjen meg a zöld fej ikon */}
                      {isUser && m.id === lastReadUserMessageId && (
                        <div
                          style={{
                            ...smallAvatarStyle,
                            background: "#10b981",
                            color: "#ffffff",
                          }}
                          title={"Látta a cég"}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        {/* Input sáv – egyelőre inaktív */}
        <div style={inputBarStyle}>
          <input
            type="text"
            placeholder="Írj üzenetet… (hamarosan)"
            disabled
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#f3f4f6",
              color: "#9ca3af",
            }}
          />
          <button
            disabled
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#e5e7eb",
              color: "#6b7280",
              cursor: "not-allowed",
            }}
          >
            Küldés
          </button>
        </div>
      </section>
    </div>
  );
};

export default Messenger;