/**
 * 个人卡片背景管理服务
 */

// 默认背景列表
export const DEFAULT_BACKGROUNDS = [
  {
    id: 'green',
    name: '绿色渐变',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
  },
  {
    id: 'blue',
    name: '蓝色渐变',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)'
  },
  {
    id: 'purple',
    name: '紫色渐变',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 100%)'
  },
  {
    id: 'orange',
    name: '橙色渐变',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
  },
  {
    id: 'red',
    name: '红色渐变',
    gradient: 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)'
  },
  {
    id: 'gray',
    name: '深灰渐变',
    gradient: 'linear-gradient(135deg, #424242 0%, #757575 100%)'
  },
  {
    id: 'cyan',
    name: '青色渐变',
    gradient: 'linear-gradient(135deg, #00BCD4 0%, #4DD0E1 100%)'
  },
  {
    id: 'pink',
    name: '粉色渐变',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)'
  }
]

// 获取默认背景列表
export const getDefaultBackgrounds = () => {
  return DEFAULT_BACKGROUNDS
}

// 获取默认背景
export const getDefaultBackground = (id: string) => {
  return DEFAULT_BACKGROUNDS.find(bg => bg.id === id)
}

// 保存用户背景选择到本地存储
export const saveUserBackground = (backgroundId: string, imageUrl?: string) => {
  const background = {
    type: imageUrl ? 'custom' : 'default',
    backgroundId: !imageUrl ? backgroundId : undefined,
    imageUrl: imageUrl,
    uploadTime: new Date().toISOString()
  }
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('userCardBackground', JSON.stringify(background))
  }
  
  // uni-app 环境
  if (typeof uni !== 'undefined') {
    uni.setStorageSync('userCardBackground', background)
  }
}

// 获取用户背景选择
export const getUserBackground = () => {
  let background = null
  
  // 浏览器环境
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('userCardBackground')
    if (stored) {
      background = JSON.parse(stored)
    }
  }
  
  // uni-app 环境
  if (!background && typeof uni !== 'undefined') {
    background = uni.getStorageSync('userCardBackground')
  }
  
  // 返回默认背景或用户选择的背景
  if (!background) {
    return {
      type: 'default',
      backgroundId: 'green',
      imageUrl: undefined
    }
  }
  
  return background
}

// 获取背景样式
export const getBackgroundStyle = (background?: any) => {
  const bg = background || getUserBackground()
  
  if (bg.type === 'custom' && bg.imageUrl) {
    return {
      backgroundImage: `url(${bg.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  
  // 默认背景
  const defaultBg = getDefaultBackground(bg.backgroundId || 'green')
  if (defaultBg) {
    return {
      background: defaultBg.gradient
    }
  }
  
  // 回退到绿色渐变
  return {
    background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
  }
}

// 验证文件
export const validateFile = (file: File): { valid: boolean; message?: string } => {
  // 检查文件大小（限制为 500KB）
  if (file.size > 500 * 1024) {
    return {
      valid: false,
      message: '文件过大，请选择小于 500KB 的文件'
    }
  }

  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '不支持的文件格式，请选择 JPG、PNG 或 WebP 格式'
    }
  }

  return { valid: true }
}

// 压缩图片
export const compressImage = (file: File, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('无法获取 canvas 上下文'))
          return
        }
        
        // 设置 canvas 大小
        canvas.width = img.width
        canvas.height = img.height
        
        // 绘制图片
        ctx.drawImage(img, 0, 0)
        
        // 压缩并转换为 Data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }
      img.onerror = () => reject(new Error('图片加载失败'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

// 处理文件上传（浏览器环境）
export const handleFileUpload = async (file: File): Promise<string> => {
  // 验证文件
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.message)
  }

  // 压缩图片
  const compressedDataUrl = await compressImage(file)
  return compressedDataUrl
}

// 处理文件上传（uni-app 环境）
export const handleUniFileUpload = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 获取文件信息
        const fileManager = uni.getFileSystemManager()
        fileManager.getFileInfo({
          filePath: tempFilePath,
          success: (fileInfo) => {
            // 检查文件大小
            if (fileInfo.size > 500 * 1024) {
              reject(new Error('文件过大，请选择小于 500KB 的文件'))
              return
            }
            
            // 读取文件为 Data URL
            fileManager.readFile({
              filePath: tempFilePath,
              encoding: 'base64',
              success: (fileData) => {
                const dataUrl = `data:image/jpeg;base64,${fileData.data}`
                resolve(dataUrl)
              },
              fail: (err) => reject(err)
            })
          },
          fail: (err) => reject(err)
        })
      },
      fail: (err) => reject(err)
    })
  })
}
