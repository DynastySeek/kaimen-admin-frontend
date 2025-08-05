#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 递归获取目录下所有文件
 * @param {string} dir - 目录路径
 * @param {string[]} extensions - 文件扩展名数组
 * @returns {string[]} 文件路径数组
 */
function getAllFiles(dir, extensions = ['.js', '.vue', '.css', '.ts']) {
  const files = []
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    
    if (stat.isDirectory()) {
      // 跳过 node_modules 和 .git 目录
      if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
        files.push(...getAllFiles(fullPath, extensions))
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item)
      if (extensions.includes(ext)) {
        files.push(fullPath)
      }
    }
  }
  
  return files
}

/**
 * 删除JS/CSS文件中的作者注释块
 * @param {string} content - 文件内容
 * @returns {string} 处理后的内容
 */
function removeJSComments(content) {
  // 匹配 /**********************************...@Author: Ronnie Zhang...*********************************/
  const jsCommentRegex = /\/\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*[\s\S]*?@Author: Ronnie Zhang[\s\S]*?\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\//g
  
  return content.replace(jsCommentRegex, '')
}

/**
 * 删除Vue文件中的HTML注释块
 * @param {string} content - 文件内容
 * @returns {string} 处理后的内容
 */
function removeVueComments(content) {
  // 匹配 <!--------------------------------...@Author: Ronnie Zhang...-------------------------------->
  const vueCommentRegex = /<!-{30,}[\s\S]*?@Author: Ronnie Zhang[\s\S]*?-{30,}>/g
  
  return content.replace(vueCommentRegex, '')
}

/**
 * 处理单个文件
 * @param {string} filePath - 文件路径
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let newContent = content
    
    // 检查是否包含作者信息
    if (!content.includes('@Author: Ronnie Zhang')) {
      return
    }
    
    const ext = path.extname(filePath)
    
    if (ext === '.vue') {
      newContent = removeVueComments(content)
    } else {
      newContent = removeJSComments(content)
    }
    
    // 如果内容有变化，写回文件
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8')
      console.log(`✅ 已处理: ${path.relative(process.cwd(), filePath)}`)
    }
  } catch (error) {
    console.error(`❌ 处理文件失败: ${filePath}`, error.message)
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始删除项目中的作者注释块...')
  
  const projectRoot = process.cwd()
  const files = getAllFiles(projectRoot)
  
  console.log(`📁 找到 ${files.length} 个文件`)
  
  let processedCount = 0
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    if (content.includes('@Author: Ronnie Zhang')) {
      processFile(file)
      processedCount++
    }
  }
  
  console.log(`\n🎉 完成！共处理了 ${processedCount} 个包含作者注释的文件`)
}

// 运行脚本
main()

// ES模块导出
export {
  getAllFiles,
  removeJSComments,
  removeVueComments,
  processFile
}