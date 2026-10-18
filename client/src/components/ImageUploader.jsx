"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { uploadToImgBB, imgbbEnabled } from "@/lib/imgbb";
import toast from "react-hot-toast";

export default function ImageUploader({ value, onChange, label = "Image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!imgbbEnabled) {
      toast.error("imgBB is not configured. Paste an image URL instead.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onChange(url);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          className="input"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="btn-outline shrink-0"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="preview" className="mt-2 h-20 w-20 rounded-lg border object-cover" />
      )}
    </div>
  );
}
