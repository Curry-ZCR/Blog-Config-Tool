import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import app from '../../index'
import { settingsService } from '../../services/SettingsService'

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

describe('Posts API Routes', () => {
  const testBlogPath = path.join(__dirname, '..', 'fixtures', 'test-blog-posts')
  const postsPath = path.join(testBlogPath, 'content', 'post')

  beforeAll(async () => {
    // Create test blog structure
    await fs.promises.mkdir(path.join(testBlogPath, 'config', '_default'), { recursive: true })
    await fs.promises.mkdir(postsPath, { recursive: true })
    
    // Create required files
    await fs.promises.writeFile(path.join(testBlogPath, 'hugo.toml'), '')
    await fs.promises.writeFile(
      path.join(testBlogPath, 'config', '_default', 'params.yml'),
      'author: test\n'
    )
    
    // Set blog path
    await settingsService.setBlogPath(testBlogPath)
  })

  afterAll(async () => {
    // Clean up test directory
    await fs.promises.rm(testBlogPath, { recursive: true, force: true })
  })

  beforeEach(async () => {
    // Clean posts directory before each test
    const entries = await fs.promises.readdir(postsPath).catch(() => [])
    for (const entry of entries) {
      if (entry !== '_index.md') {
        await fs.promises.unlink(path.join(postsPath, entry)).catch(() => {})
      }
    }
  })


  describe('GET /api/posts', () => {
    it('should return empty array when no posts exist', async () => {
      const response = await request(app).get('/api/posts')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.posts).toEqual([])
    })

    it('should return list of posts with metadata', async () => {
      // Create a test post
      const postContent = `---
title: 'Test Post'
date: 2024-01-15
draft: false
categories:
  - Tech
tags:
  - test
---

Content here`
      await fs.promises.writeFile(path.join(postsPath, 'test-post.md'), postContent)

      const response = await request(app).get('/api/posts')
      
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.posts).toHaveLength(1)
      expect(response.body.posts[0].title).toBe('Test Post')
      expect(response.body.posts[0].categories).toContain('Tech')
      expect(response.body.posts[0].tags).toContain('test')
    })
  })

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const postData = {
        title: 'My New Post',
        date: '2024-01-15',
        categories: ['Tech'],
        tags: ['test', 'new'],
        draft: false
      }

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
      
      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.filePath).toContain('my-new-post.md')
      
      // Verify file was created
      const filePath = path.join(postsPath, 'my-new-post.md')
      expect(fs.existsSync(filePath)).toBe(true)
    })


    it('should reject post without title', async () => {
      const postData = {
        date: '2024-01-15'
      }

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Title is required')
    })

    it('should reject post without date', async () => {
      const postData = {
        title: 'Test Post'
      }

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Date is required')
    })

    it('should reject post with invalid date format', async () => {
      const postData = {
        title: 'Test Post',
        date: 'invalid-date'
      }

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('Invalid date format')
    })

    it('should return 409 when file already exists', async () => {
      // Create existing file
      await fs.promises.writeFile(path.join(postsPath, 'existing-post.md'), '---\ntitle: Existing\ndate: 2024-01-01\n---\n')

      const postData = {
        title: 'Existing Post',
        date: '2024-01-15'
      }

      const response = await request(app)
        .post('/api/posts')
        .send(postData)
      
      expect(response.status).toBe(409)
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('already exists')
    })
  })
})
