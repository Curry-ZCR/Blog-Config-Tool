import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { FileService, IMAGE_EXTENSIONS } from '../../services/FileService'

/**
 * **Feature: blog-config-tool, Property 2: Image Listing Completeness**
 * **Validates: Requirements 1.3, 2.3, 3.1, 3.2, 3.4**
 * 
 * For any Static_Directory containing image files, the image listing API SHALL return
 * all images with correct paths, filenames, folder organization, and file metadata.
 */

// Generate valid filename (alphanumeric only)
const filenameArbitrary = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
  { minLength: 1, maxLength: 20 }
)

// Generate image extension
const imageExtArbitrary = fc.constantFrom(...IMAGE_EXTENSIONS)

// Generate folder name
const folderNameArbitrary = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
  { minLength: 1, maxLength: 15 }
)

// Generate a file structure with images
interface TestFile {
  folder: string
  name: string
  ext: string
  isImage: boolean
}

const testFileArbitrary: fc.Arbitrary<TestFile> = fc.record({
  folder: fc.oneof(fc.constant(''), folderNameArbitrary),
  name: filenameArbitrary,
  ext: fc.oneof(imageExtArbitrary, fc.constant('.txt'), fc.constant('.md')),
  isImage: fc.constant(true) // Will be computed
}).map(file => ({
  ...file,
  isImage: IMAGE_EXTENSIONS.includes(file.ext)
}))

// Create a minimal PNG file (1x1 pixel)
function createMinimalPng(): Buffer {
  return Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, // IHDR length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, // bit depth, color type
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xde, // CRC
    0x00, 0x00, 0x00, 0x0c, // IDAT length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0xd7, 0x63, 0xf8, 0xff, 0xff, 0xff, 0x00, 0x05, 0xfe, 0x02, 0xfe,
    0xa3, 0x6c, 0x3c, 0x28, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4e, 0x44, // IEND
    0xae, 0x42, 0x60, 0x82  // CRC
  ])
}

// Create a minimal JPEG file
function createMinimalJpeg(): Buffer {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
    0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00, 0x01, 0x7d,
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
    0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
    0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
    0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
    0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
    0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
    0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
    0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
    0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
    0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
    0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
    0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd5, 0xdb, 0x20, 0xa8, 0xf1, 0x5e, 0x5a,
    0x33, 0xec, 0xa8, 0x3f, 0xff, 0xd9
  ])
}

// Create file content based on extension
function createFileContent(ext: string): Buffer {
  if (ext === '.png') return createMinimalPng()
  if (ext === '.jpg' || ext === '.jpeg') return createMinimalJpeg()
  if (ext === '.gif') {
    return Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
      0x01, 0x00, // width: 1
      0x01, 0x00, // height: 1
      0x00, 0x00, 0x00, // flags, bgcolor, aspect
      0x3b // trailer
    ])
  }
  // For other files, just create a small buffer
  return Buffer.from('test content')
}

describe('Image Listing Completeness', () => {
  let fileService: FileService
  let tempDir: string

  beforeEach(async () => {
    fileService = new FileService()
    // Create a temporary directory for testing
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'blog-test-'))
    const staticDir = path.join(tempDir, 'static')
    await fs.promises.mkdir(staticDir, { recursive: true })
    fileService.setBlogPath(tempDir)
  })

  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir) {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    }
  })

  /**
   * **Feature: blog-config-tool, Property 2: Image Listing Completeness**
   * **Validates: Requirements 1.3, 2.3, 3.1, 3.2, 3.4**
   */
  it('should list all image files with correct metadata', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(testFileArbitrary, { minLength: 1, maxLength: 10 }),
        async (files) => {
          const staticDir = path.join(tempDir, 'static')
          
          // Create unique files (avoid duplicates)
          const uniqueFiles = new Map<string, TestFile>()
          for (const file of files) {
            const fullName = `${file.name}${file.ext}`
            const key = file.folder ? `${file.folder}/${fullName}` : fullName
            uniqueFiles.set(key, file)
          }

          // Create the files
          for (const [, file] of uniqueFiles) {
            const folderPath = file.folder 
              ? path.join(staticDir, file.folder)
              : staticDir
            
            await fs.promises.mkdir(folderPath, { recursive: true })
            
            const filePath = path.join(folderPath, `${file.name}${file.ext}`)
            const content = createFileContent(file.ext)
            await fs.promises.writeFile(filePath, content)
          }

          // List images
          const images = await fileService.listImages()

          // Count expected images
          const expectedImages = Array.from(uniqueFiles.values()).filter(f => f.isImage)

          // Verify all images are listed
          expect(images.length).toBe(expectedImages.length)

          // Verify each image has correct metadata
          for (const image of images) {
            expect(image.path).toBeDefined()
            expect(image.name).toBeDefined()
            expect(typeof image.folder).toBe('string')
            expect(typeof image.size).toBe('number')
            expect(image.size).toBeGreaterThan(0)
            
            // Verify path format (forward slashes)
            expect(image.path).not.toContain('\\')
            
            // Verify the file exists
            const fullPath = path.join(staticDir, image.path)
            const exists = fs.existsSync(fullPath)
            expect(exists).toBe(true)
          }

          // Clean up for next iteration
          const entries = await fs.promises.readdir(staticDir, { withFileTypes: true })
          for (const entry of entries) {
            const entryPath = path.join(staticDir, entry.name)
            await fs.promises.rm(entryPath, { recursive: true, force: true })
          }

          return true
        }
      ),
      { numRuns: 50 } // Reduced runs due to file I/O
    )
  })

  it('should correctly identify image files by extension', () => {
    fc.assert(
      fc.property(
        fc.tuple(filenameArbitrary, fc.constantFrom(...IMAGE_EXTENSIONS)),
        ([name, ext]) => {
          const filename = `${name}${ext}`
          return fileService.isImageFile(filename) === true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not identify non-image files as images', () => {
    fc.assert(
      fc.property(
        fc.tuple(filenameArbitrary, fc.constantFrom('.txt', '.md', '.json', '.yml', '.html', '.css', '.js')),
        ([name, ext]) => {
          const filename = `${name}${ext}`
          return fileService.isImageFile(filename) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should organize images by folder correctly', async () => {
    const staticDir = path.join(tempDir, 'static')
    
    // Create images in different folders
    const folders = ['images', 'avatar', 'covers']
    for (const folder of folders) {
      const folderPath = path.join(staticDir, folder)
      await fs.promises.mkdir(folderPath, { recursive: true })
      await fs.promises.writeFile(
        path.join(folderPath, 'test.png'),
        createMinimalPng()
      )
    }
    
    // Also create one in root
    await fs.promises.writeFile(
      path.join(staticDir, 'root.png'),
      createMinimalPng()
    )

    const images = await fileService.listImages()

    // Verify folder organization
    expect(images.length).toBe(4)
    
    const rootImage = images.find(img => img.name === 'root.png')
    expect(rootImage?.folder).toBe('')
    
    for (const folder of folders) {
      const folderImage = images.find(img => img.folder === folder)
      expect(folderImage).toBeDefined()
      expect(folderImage?.path).toBe(`${folder}/test.png`)
    }
  })
})
