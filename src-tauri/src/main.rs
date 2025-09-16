// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{engine::general_purpose, Engine as _};
use serde::Deserialize;
use std::fs;
use std::path::PathBuf;

#[derive(Deserialize)]
struct ImagePayload {
    filename: String,
    data: String,
    #[serde(default)]
    subdir: Option<String>,
}

fn decode_image_data(image_data: &str) -> Result<Vec<u8>, String> {
    let base64_data = image_data
        .strip_prefix("data:image/jpeg;base64,")
        .or_else(|| image_data.strip_prefix("data:image/png;base64,"))
        .or_else(|| image_data.split(',').nth(1))
        .ok_or("Invalid image data format")?;

    general_purpose::STANDARD
        .decode(base64_data)
        .map_err(|e| format!("Failed to decode image: {}", e))
}

#[tauri::command]
async fn save_image(
    app: tauri::AppHandle,
    image_data: String,
    filename: String,
    subdir: Option<String>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let folder_path =
        tauri::async_runtime::spawn_blocking(move || app.dialog().file().blocking_pick_folder())
            .await
            .map_err(|e| format!("Task error: {}", e))?;

    if let Some(folder) = folder_path {
        let mut target_folder = PathBuf::from(folder.as_path().ok_or("Invalid folder path")?);
        if let Some(sub) = subdir.filter(|s| !s.is_empty()) {
            target_folder.push(sub);
        }
        fs::create_dir_all(&target_folder)
            .map_err(|e| format!("Failed to create folders: {}", e))?;

        let file_path = target_folder.join(format!("{}.jpg", filename));
        let image_bytes = decode_image_data(&image_data)?;
        fs::write(&file_path, image_bytes).map_err(|e| format!("Failed to write file: {}", e))?;

        Ok(format!("Image saved to: {}", file_path.display()))
    } else {
        Err("Folder selection cancelled by user".to_string())
    }
}

#[tauri::command]
async fn save_multiple_images(
    app: tauri::AppHandle,
    images: Vec<ImagePayload>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let folder_path =
        tauri::async_runtime::spawn_blocking(move || app.dialog().file().blocking_pick_folder())
            .await
            .map_err(|e| format!("Task error: {}", e))?;

    if let Some(folder) = folder_path {
        let base_folder = PathBuf::from(folder.as_path().ok_or("Invalid folder path")?);
        let mut saved_count = 0;
        let mut failed_count = 0;

        for item in images {
            let mut target_folder = base_folder.clone();
            if let Some(subdir) = item.subdir.filter(|s| !s.is_empty()) {
                target_folder.push(subdir);
            }
            if let Err(e) = fs::create_dir_all(&target_folder) {
                eprintln!("Failed to create folder for {}: {}", item.filename, e);
                failed_count += 1;
                continue;
            }

            let file_path = target_folder.join(format!("{}.jpg", item.filename));
            match decode_image_data(&item.data) {
                Ok(bytes) => {
                    if let Err(e) = fs::write(&file_path, bytes) {
                        eprintln!("Failed to save {}: {}", item.filename, e);
                        failed_count += 1;
                    } else {
                        saved_count += 1;
                    }
                }
                Err(e) => {
                    eprintln!("Failed to decode {}: {}", item.filename, e);
                    failed_count += 1;
                }
            }
        }

        let message = if failed_count == 0 {
            format!(
                "Successfully saved {} images to {}",
                saved_count,
                base_folder.display()
            )
        } else {
            format!(
                "Saved {} images, {} failed. Location: {}",
                saved_count,
                failed_count,
                base_folder.display()
            )
        };

        Ok(message)
    } else {
        Err("Folder selection cancelled by user".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_image, save_multiple_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
