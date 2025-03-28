/**
 * Uploads an image to Cloudinary and returns the secure URL
 * @param blob The image blob to upload
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * Checks if the user has reached the daily limit for QR code generation
 * @param limit The maximum number of QR codes that can be generated per day
 * @returns Whether the user has reached the daily limit
 */
export function checkDailyQRLimit(limit = 5): boolean {
  const today = new Date().toISOString().split("T")[0];
  const storedData = JSON.parse(localStorage.getItem("qrGenCount") || "{}");

  return storedData.date === today && storedData.count >= limit;
}

/**
 * Updates the QR code generation count for the current day
 */
export function updateQRGenerationCount(): void {
  const today = new Date().toISOString().split("T")[0];
  const storedData = JSON.parse(localStorage.getItem("qrGenCount") || "{}");

  localStorage.setItem(
    "qrGenCount",
    JSON.stringify({
      date: today,
      count: (storedData.date === today ? storedData.count : 0) + 1,
    }),
  );
}
