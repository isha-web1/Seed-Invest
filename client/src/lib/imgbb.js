const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "";

export const imgbbEnabled = Boolean(IMGBB_KEY);

export async function uploadToImgBB(file) {
  if (!IMGBB_KEY) throw new Error("imgBB is not configured.");
  const body = new FormData();
  body.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body,
  });
  const data = await res.json();
  if (!data?.success) throw new Error(data?.error?.message || "Image upload failed.");
  return data.data.url;
}
