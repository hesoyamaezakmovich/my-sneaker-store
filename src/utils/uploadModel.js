import api from '../services/api'

/**
 * Загружает 3D-файл напрямую в S3 через presigned URL, минуя nginx.
 * Решает ограничение 413 Request Entity Too Large на прокси-сервере.
 */
export async function uploadModelDirect(file, onProgress) {
  // 1. Получаем presigned PUT URL с сервера
  const { data } = await api.get('/upload/model-presign', {
    params: { filename: file.name },
  })
  const { presignedUrl, url, originalName, format } = data

  // 2. Загружаем файл напрямую в S3 (не через nginx)
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`S3 upload failed: ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Ошибка сети при загрузке в S3'))
    xhr.send(file)
  })

  return { url, originalName, format }
}
