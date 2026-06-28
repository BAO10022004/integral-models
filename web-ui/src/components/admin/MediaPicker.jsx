import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CloudUpload, Pencil, Images, X, Film, Trash2, Loader2 } from "lucide-react";
import { DOTNET_API_URL } from "../../config";

/**
 * MediaPicker – file upload widget matching the design with:
 *   - Left: drag-drop zone with upload icon + "Chọn hình/video" button
 *   - Right: live preview + "Chỉnh sửa" + "Chọn hình từ upload" buttons
 *
 * Props:
 *   value          {string}   Current media URL / base64 (empty = no media)
 *   onChange       {fn}       Called with (base64 | blobUrl | "")
 *   accept         {string}   MIME types, e.g. "image/*" | "video/mp4"
 *   type           {"image"|"video"}
 *   label          {string}   Shown below drop-zone
 *   dimensionHint  {string}   e.g. "Width: 187 px – Height: 82 px"
 *   formatHint     {string}   e.g. "(jpg,gif,png,jpeg,webp)"
 *   maxMB          {number}   Size limit in MB (default 2)
 *   onSizeError    {fn}       Called when file too large
 */
export default function MediaPicker({
  value = "",
  onChange,
  accept = "image/*",
  type = "image",
  label = "Kéo và thả hình vào đây",
  dimensionHint = "",
  formatHint = "(jpg,gif,png,jpeg,webp)",
  maxMB = 2,
  onSizeError,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Library modal states
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [libError, setLibError] = useState("");
  const [draggingLib, setDraggingLib] = useState(false);

  const isVideo = type === "video";

  const processFile = async (file) => {
    if (!file) return;
    if (file.size > maxMB * 1024 * 1024) {
      if (onSizeError) onSizeError(file);
      return;
    }

    // Proactively upload file to Dotnet API server
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${DOTNET_API_URL}/upload`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onChange(data.url); // Use the static URL from server
    } catch (err) {
      console.error(err);
      alert("Lỗi tải tệp lên server. Đang dùng tạm chế độ xem trước cục bộ.");

      // Fallback to local preview if server fails
      if (isVideo) {
        const blobUrl = URL.createObjectURL(file);
        onChange(blobUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => onChange(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleClear = () => onChange("");

  // Media Library helpers
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const openLibrary = async () => {
    setShowLibrary(true);
    setLoadingLib(true);
    setLibError("");
    try {
      const res = await fetch(`${DOTNET_API_URL}/upload`);
      if (!res.ok) throw new Error("Failed to fetch uploaded files");
      const data = await res.json();

      // Filter based on file extension
      const filtered = data.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        const isVidExt = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
        return isVideo ? isVidExt : !isVidExt;
      });
      setLibraryFiles(filtered);
    } catch (err) {
      console.error(err);
      setLibError("Không thể tải danh sách tệp tin.");
    } finally {
      setLoadingLib(false);
    }
  };

  const deleteFileFromLib = async (e, fileName) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc muốn xóa file "${fileName}"?`)) return;
    try {
      const res = await fetch(`${DOTNET_API_URL}/upload/${fileName}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Delete failed");

      setLibraryFiles(prev => prev.filter(f => f.name !== fileName));
      // If current selected value is the deleted file, clear it
      if (value.includes(`/uploads/${fileName}`)) {
        onChange("");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa file!");
    }
  };

  const selectFileFromLib = (fileUrl) => {
    onChange(fileUrl);
    setShowLibrary(false);
  };

  const handleLibDragOver = (e) => {
    e.preventDefault();
    setDraggingLib(true);
  };

  const handleLibDragLeave = (e) => {
    e.preventDefault();
    setDraggingLib(false);
  };

  const handleLibDrop = async (e) => {
    e.preventDefault();
    setDraggingLib(false);
    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      if (file.size > maxMB * 1024 * 1024) {
        alert(`File "${file.name}" vượt quá ${maxMB}MB!`);
        continue;
      }

      const ext = file.name.split('.').pop().toLowerCase();
      const isVidExt = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
      if (isVideo !== isVidExt) {
        alert(`Vui lòng chỉ tải lên tệp tin dạng ${isVideo ? 'video' : 'hình ảnh'}!`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      try {
        setLoadingLib(true);
        const res = await fetch(`${DOTNET_API_URL}/upload`, {
          method: "POST",
          body: formData
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        const newFile = {
          name: data.filename,
          url: data.url,
          size: file.size,
          createdAt: new Date().toISOString()
        };
        setLibraryFiles(prev => [newFile, ...prev]);
      } catch (err) {
        console.error(err);
        alert(`Lỗi tải tệp "${file.name}" lên server!`);
      } finally {
        setLoadingLib(false);
      }
    }
  };

  // ─── shared styles ───────────────────────────────────────────────────────
  const RED = "#e53e3e";
  const btnRed = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: "6px", padding: "9px 20px", fontSize: "13px", fontWeight: "700",
    cursor: "pointer", border: "none", background: RED, color: "#fff",
    borderRadius: 0, transition: "opacity .15s", fontFamily: "inherit",
  };
  const btnRedOutline = {
    ...btnRed,
    background: "transparent", color: RED, border: `1.5px solid ${RED}`,
  };

  // Modal styles
  const modalOverlayStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  };

  const modalContainerStyle = {
    background: "var(--admin-card-bg, #111)",
    border: "1px solid var(--admin-card-border, #333)",
    width: "680px",
    maxWidth: "95%",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    padding: "24px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  };

  return (
    <div>
      {/* ── Main 2-col picker ── */}
      <div style={{ display: "flex", gap: "0", alignItems: "stretch" }}>

        {/* LEFT – drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            width: "220px", flexShrink: 0,
            border: `2px dashed ${dragging ? RED : "#d1d5db"}`,
            background: dragging ? "#fff5f5" : "#fafafa",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "8px", padding: "24px 16px",
            transition: "border-color .2s, background .2s",
            cursor: "pointer",
          }}
          onClick={() => inputRef.current?.click()}
        >
          <CloudUpload size={40} strokeWidth={1.5} style={{ color: "#94a3b8" }} />
          <span style={{ fontSize: "13px", color: "#64748b", textAlign: "center", lineHeight: "1.5" }}>
            {label}
          </span>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Hoặc</span>
          <button
            type="button"
            style={btnRed}
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          >
            {isVideo ? <><Film size={13} /> Chọn video</> : <><Images size={13} /> Chọn hình</>}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            style={{ display: "none" }}
            onChange={(e) => { if (e.target.files[0]) processFile(e.target.files[0]); e.target.value = ""; }}
          />
        </div>

        {/* RIGHT – preview panel */}
        {value ? (
          <div style={{
            flex: 1, borderTop: "2px dashed #d1d5db",
            borderRight: "2px dashed #d1d5db", borderBottom: "2px dashed #d1d5db",
            borderLeft: "none", background: "#fff",
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", justifyContent: "center",
            gap: "12px", padding: "20px 24px", position: "relative",
          }}>
            {/* Clear button */}
            <button
              type="button"
              title="Xóa"
              onClick={handleClear}
              style={{
                position: "absolute", top: "10px", right: "10px",
                background: "#fee2e2", border: "none", borderRadius: "50%",
                width: "26px", height: "26px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: RED,
              }}
            >
              <X size={14} />
            </button>

            {/* Media preview */}
            {isVideo ? (
              <video
                src={value}
                muted autoPlay loop playsInline
                style={{ maxHeight: "100px", maxWidth: "100%", border: "1px solid #e2e8f0", objectFit: "cover", display: "block" }}
              />
            ) : (
              <img
                src={value}
                alt="preview"
                style={{ maxHeight: "100px", maxWidth: "100%", border: "1px solid #e2e8f0", objectFit: "contain", display: "block" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button type="button" style={btnRed} onClick={() => inputRef.current?.click()}>
                <Pencil size={13} />
                {isVideo ? "Thay video" : "Chỉnh sửa ảnh"}
              </button>
              <button type="button" style={btnRedOutline} onClick={openLibrary}>
                <Images size={13} />
                {isVideo ? "Chọn video từ upload" : "Chọn hình từ upload"}
              </button>
            </div>
          </div>
        ) : (
          /* No media yet – empty right panel hint */
          <div style={{
            flex: 1, borderTop: "2px dashed #d1d5db",
            borderRight: "2px dashed #d1d5db", borderBottom: "2px dashed #d1d5db",
            borderLeft: "none", background: "#fafafa",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}>
            <span style={{ fontSize: "12px", color: "#cbd5e1", textAlign: "center" }}>
              {isVideo ? "Chưa có video" : "Chưa có hình"}<br />
              Kéo thả hoặc chọn file
            </span>
          </div>
        )}
      </div>

      {/* ── Dimension / format hint ── */}
      {(dimensionHint || formatHint) && (
        <p style={{ fontSize: "12px", fontWeight: "600", color: "#475569", margin: "8px 0 0 0" }}>
          {dimensionHint}{dimensionHint && formatHint ? " " : ""}{formatHint}
        </p>
      )}

      {/* ── Media Library Modal ── */}
      {showLibrary && createPortal(
        <div style={modalOverlayStyle}>
          <div
            style={{ ...modalContainerStyle, position: "relative" }}
            onDragOver={handleLibDragOver}
            onDragLeave={handleLibDragLeave}
            onDrop={handleLibDrop}
          >
            {/* Drag Overlay inside Modal */}
            {draggingLib && (
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                border: "3px dashed var(--admin-text-primary, #fff)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10000,
                color: "#fff",
                gap: "12px",
                pointerEvents: "none"
              }}>
                <CloudUpload size={48} className="animate-bounce" />
                <span style={{ fontSize: "16px", fontWeight: "700" }}>Thả các tệp tin để tải lên server ngay!</span>
              </div>
            )}

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--admin-card-border, #333)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "800", textTransform: "uppercase", color: "var(--admin-text-primary, #fff)", margin: 0 }}>
                {isVideo ? "Thư viện Video đã tải lên" : "Thư viện Hình ảnh đã tải lên"}
              </h3>
              <button type="button" onClick={() => setShowLibrary(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--admin-text-secondary, #999)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: "280px", maxHeight: "55vh", marginBottom: "20px" }}>
              {loadingLib ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--admin-text-secondary, #999)", gap: "8px" }}>
                  <Loader2 className="animate-spin" size={18} /> Đang tải danh sách...
                </div>
              ) : libError ? (
                <div style={{ color: "#ef4444", textAlign: "center", padding: "40px 0", fontWeight: "700" }}>{libError}</div>
              ) : libraryFiles.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--admin-text-secondary, #999)", padding: "60px 0", fontSize: "13px" }}>
                  Chưa có {isVideo ? "video" : "hình ảnh"} nào được tải lên server.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "16px" }}>
                  {libraryFiles.map((file, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectFileFromLib(file.url)}
                      style={{
                        border: "1px solid var(--admin-card-border, #333)",
                        background: "var(--admin-input-bg, #222)",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--admin-text-primary, #fff)"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--admin-card-border, #333)"}
                    >
                      {/* Thumbnail Preview */}
                      <div style={{ height: "90px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", overflow: "hidden", position: "relative" }}>
                        {isVideo ? (
                          <video src={file.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <img src={file.url} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => deleteFileFromLib(e, file.name)}
                          style={{
                            position: "absolute", top: "4px", right: "4px",
                            background: "rgba(239, 68, 68, 0.9)", border: "none",
                            width: "22px", height: "22px", borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", cursor: "pointer", padding: 0
                          }}
                          title="Xóa tệp"
                        >
                          <Trash2 size={12} style={{ margin: "auto" }} />
                        </button>
                      </div>

                      {/* Info */}
                      <div style={{ padding: "8px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ fontWeight: "700", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", color: "var(--admin-text-primary, #fff)" }} title={file.name}>
                          {file.name}
                        </div>
                        <div style={{ color: "var(--admin-text-secondary, #999)" }}>
                          {formatBytes(file.size)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--admin-card-border, #333)", paddingTop: "12px", gap: "10px" }}>
              <button type="button" onClick={() => setShowLibrary(false)} style={btnRedOutline}>
                Đóng
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
