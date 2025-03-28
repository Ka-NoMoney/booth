import type { Frame } from "@/types"
import { FRAMES } from "@/constants/assets"

/**
 * Validates a frame object to ensure it has all required properties
 * @param frame The frame object to validate
 * @returns Whether the frame is valid
 */
export function isValidFrame(frame: Frame | null): boolean {
  if (!frame) return true // null is valid (no frame)
  return typeof frame.id === "string" && typeof frame.name === "string"
}

/**
 * Gets a frame by its ID
 * @param frameId The ID of the frame to get
 * @returns The frame object or null if not found
 */
export function getFrameById(frameId: string | null): Frame | null {
  if (!frameId) return null
  return FRAMES.find((frame) => frame.id === frameId) || null
}

/**
 * Preloads a frame image to ensure it's ready when displayed
 * @param frameUrl The URL of the frame image to preload
 * @returns A promise that resolves when the image is loaded
 */
export function preloadFrameImage(frameUrl: string | null): Promise<void> {
  return new Promise((resolve) => {
    if (!frameUrl) {
      resolve()
      return
    }

    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => {
      console.error(`Failed to preload frame image: ${frameUrl}`)
      resolve()
    }
    img.src = frameUrl
  })
}

/**
 * Handles frame selection with validation and preloading
 * @param frameId The ID of the frame to select
 * @param callback Function to call with the selected frame
 */
export async function handleFrameSelection(
  frameId: string | null,
  callback: (frame: string | null) => void,
): Promise<void> {
  try {
    // If frameId is null, we're deselecting the frame
    if (frameId === null) {
      callback(null)
      return
    }

    // Get the frame object
    const frame = getFrameById(frameId)

    // Validate the frame
    if (!isValidFrame(frame)) {
      console.error(`Invalid frame: ${frameId}`)
      return
    }

    // // Preload the frame image if it exists
    // if (frame && frame.url) {
    //   await preloadFrameImage(frame.url)
    // }

    // Update the state with the selected frame ID
    callback(frameId)
  } catch (error) {
    console.error("Error selecting frame:", error)
  }
}

