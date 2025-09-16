// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
async fn save_image(app: tauri::AppHandle, image_data: String, filename: String) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    
    // Create a blocking task for the dialog
    let file_path = tauri::async_runtime::spawn_blocking(move || {
        app.dialog()
            .file()
            .add_filter("JPEG Image", &["jpg", "jpeg"])
            .set_file_name(&format!("{}.jpg", filename))
            .blocking_save_file()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?;

    if let Some(path) = file_path {
        // Convert FilePath to PathBuf
        let path_buf = PathBuf::from(path.as_path().ok_or("Invalid path")?);
        
        // Remove data URL prefix
        let base64_data = image_data
            .strip_prefix("data:image/jpeg;base64,")
            .or_else(|| image_data.strip_prefix("data:image/png;base64,"))
            .or_else(|| {
                // If no prefix found, try to get the part after comma
                image_data.split(',').nth(1)
            })
            .ok_or("Invalid image data format")?;
        
        // Decode base64
        let image_bytes = general_purpose::STANDARD
            .decode(base64_data)
            .map_err(|e| format!("Failed to decode image: {}", e))?;
        
        // Write file
        fs::write(&path_buf, image_bytes)
            .map_err(|e| format!("Failed to write file: {}", e))?;
        
        Ok(format!("Image saved to: {}", path_buf.display()))
    } else {
        Err("Save cancelled by user".to_string())
    }
}

#[tauri::command]
async fn save_multiple_images(
    app: tauri::AppHandle,
    images: Vec<(String, String)>
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;
    
    // Create a blocking task for the dialog
    let folder_path = tauri::async_runtime::spawn_blocking(move || {
        app.dialog()
            .file()
            .blocking_pick_folder()
    })
    .await
    .map_err(|e| format!("Task error: {}", e))?;

    if let Some(folder) = folder_path {
        // Convert FilePath to PathBuf
        let folder_buf = PathBuf::from(folder.as_path().ok_or("Invalid folder path")?);
        
        let mut saved_count = 0;
        let mut failed_count = 0;
        
        for (filename, image_data) in images {
            let file_path = folder_buf.join(format!("{}.jpg", filename));
            
            // Remove data URL prefix
            if let Some(base64_data) = image_data
                .strip_prefix("data:image/jpeg;base64,")
                .or_else(|| image_data.strip_prefix("data:image/png;base64,"))
                .or_else(|| image_data.split(',').nth(1)) 
            {
                match general_purpose::STANDARD.decode(base64_data) {
                    Ok(image_bytes) => {
                        match fs::write(&file_path, image_bytes) {
                            Ok(_) => saved_count += 1,
                            Err(e) => {
                                eprintln!("Failed to save {}: {}", filename, e);
                                failed_count += 1;
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to decode {}: {}", filename, e);
                        failed_count += 1;
                    }
                }
            } else {
                eprintln!("Invalid image data format for {}", filename);
                failed_count += 1;
            }
        }
        
        let message = if failed_count == 0 {
            format!("Successfully saved {} images to {}", saved_count, folder_buf.display())
        } else {
            format!("Saved {} images, {} failed. Location: {}", saved_count, failed_count, folder_buf.display())
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
        .invoke_handler(tauri::generate_handler![save_image, save_multiple_images])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
