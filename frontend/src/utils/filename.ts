/**
 * Filename generator utility for the Blog Config Tool
 * Requirements: 2.4, 4.3
 * 
 * Converts post titles to URL-safe filenames:
 * - Converts Chinese characters to pinyin
 * - Replaces spaces with hyphens
 * - Removes invalid URL characters
 */

// Basic pinyin mapping for common Chinese characters
// This is a simplified mapping - for production, consider using a full pinyin library
const PINYIN_MAP: Record<string, string> = {
  // Common characters
  '的': 'de', '一': 'yi', '是': 'shi', '不': 'bu', '了': 'le', '在': 'zai',
  '人': 'ren', '有': 'you', '我': 'wo', '他': 'ta', '这': 'zhe', '个': 'ge',
  '们': 'men', '中': 'zhong', '来': 'lai', '上': 'shang', '大': 'da', '为': 'wei',
  '和': 'he', '国': 'guo', '地': 'di', '到': 'dao', '以': 'yi', '说': 'shuo',
  '时': 'shi', '要': 'yao', '就': 'jiu', '出': 'chu', '会': 'hui', '可': 'ke',
  '也': 'ye', '你': 'ni', '对': 'dui', '生': 'sheng', '能': 'neng', '而': 'er',
  '子': 'zi', '那': 'na', '得': 'de', '于': 'yu', '着': 'zhe', '下': 'xia',
  '自': 'zi', '之': 'zhi', '年': 'nian', '过': 'guo', '发': 'fa', '后': 'hou',
  '作': 'zuo', '里': 'li', '用': 'yong', '道': 'dao', '行': 'xing', '所': 'suo',
  '然': 'ran', '家': 'jia', '种': 'zhong', '事': 'shi', '成': 'cheng', '方': 'fang',
  '多': 'duo', '经': 'jing', '么': 'me', '去': 'qu', '法': 'fa', '学': 'xue',
  '如': 'ru', '都': 'dou', '同': 'tong', '现': 'xian', '当': 'dang', '没': 'mei',
  '动': 'dong', '面': 'mian', '起': 'qi', '看': 'kan', '定': 'ding', '天': 'tian',
  '分': 'fen', '还': 'hai', '进': 'jin', '好': 'hao', '小': 'xiao', '部': 'bu',
  '其': 'qi', '些': 'xie', '主': 'zhu', '样': 'yang', '理': 'li', '心': 'xin',
  '她': 'ta', '本': 'ben', '前': 'qian', '开': 'kai', '但': 'dan', '因': 'yin',
  '只': 'zhi', '从': 'cong', '想': 'xiang', '实': 'shi', '日': 'ri', '军': 'jun',
  '者': 'zhe', '意': 'yi', '无': 'wu', '力': 'li', '它': 'ta', '与': 'yu',
  '长': 'chang', '把': 'ba', '机': 'ji', '十': 'shi', '民': 'min', '第': 'di',
  '公': 'gong', '此': 'ci', '已': 'yi', '工': 'gong', '使': 'shi', '情': 'qing',
  // Blog-related characters (avoiding duplicates from above)
  '博': 'bo', '客': 'ke', '文': 'wen', '章': 'zhang', '术': 'shu',
  '教': 'jiao', '笔': 'bi', '总': 'zong', '结': 'jie',
  '指': 'zhi', '南': 'nan', '北': 'bei',
  '西': 'xi', '旧': 'jiu', '高': 'gao', '低': 'di', '快': 'kuai',
  '慢': 'man', '简': 'jian', '复': 'fu', '杂': 'za', '深': 'shen',
  '浅': 'qian', '详': 'xiang', '细': 'xi', '析': 'xi', '介': 'jie',
  '绍': 'shao', '配': 'pei', '置': 'zhi', '安': 'an', '装': 'zhuang',
  '署': 'shu', '运': 'yun', '维': 'wei', '护': 'hu', '测': 'ce',
  '调': 'tiao', '优': 'you', '化': 'hua',
}


/**
 * Checks if a character is a Chinese character
 */
function isChinese(char: string): boolean {
  const code = char.charCodeAt(0)
  // CJK Unified Ideographs range
  return code >= 0x4E00 && code <= 0x9FFF
}

/**
 * Converts a Chinese character to pinyin
 * Returns the original character if no mapping exists
 */
function toPinyin(char: string): string {
  return PINYIN_MAP[char] || char
}

/**
 * Converts a string containing Chinese characters to pinyin
 */
function convertChineseToPinyin(text: string): string {
  let result = ''
  let prevWasChinese = false
  
  for (const char of text) {
    if (isChinese(char)) {
      // Add space before pinyin if previous char was also Chinese
      // to separate pinyin words
      if (prevWasChinese && result.length > 0 && !result.endsWith(' ')) {
        result += '-'
      }
      result += toPinyin(char)
      prevWasChinese = true
    } else {
      result += char
      prevWasChinese = false
    }
  }
  
  return result
}

/**
 * Generates a URL-safe filename from a post title
 * 
 * @param title - The post title to convert
 * @returns A URL-safe filename (without extension)
 * 
 * Processing steps:
 * 1. Convert Chinese characters to pinyin
 * 2. Convert to lowercase
 * 3. Replace spaces and underscores with hyphens
 * 4. Remove all non-alphanumeric characters except hyphens
 * 5. Collapse multiple hyphens into single hyphen
 * 6. Remove leading/trailing hyphens
 * 7. Ensure non-empty result
 */
export function generateFilename(title: string): string {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return 'untitled'
  }
  
  let filename = title
  
  // Step 1: Convert Chinese characters to pinyin
  filename = convertChineseToPinyin(filename)
  
  // Step 2: Convert to lowercase
  filename = filename.toLowerCase()
  
  // Step 3: Replace spaces and underscores with hyphens
  filename = filename.replace(/[\s_]+/g, '-')
  
  // Step 4: Remove all non-alphanumeric characters except hyphens
  filename = filename.replace(/[^a-z0-9-]/g, '')
  
  // Step 5: Collapse multiple hyphens into single hyphen
  filename = filename.replace(/-+/g, '-')
  
  // Step 6: Remove leading/trailing hyphens
  filename = filename.replace(/^-+|-+$/g, '')
  
  // Step 7: Ensure non-empty result
  if (filename.length === 0) {
    return 'untitled'
  }
  
  return filename
}

/**
 * Sanitizes a filename by removing or replacing invalid characters
 * Similar to generateFilename but preserves more of the original structure
 * 
 * @param filename - The filename to sanitize
 * @returns A sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string' || filename.trim().length === 0) {
    return 'untitled'
  }
  
  let sanitized = filename
  
  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, '-')
  
  // Remove invalid characters (keep alphanumeric and hyphens)
  sanitized = sanitized.replace(/[^a-zA-Z0-9-]/g, '')
  
  // Collapse multiple hyphens
  sanitized = sanitized.replace(/-+/g, '-')
  
  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '')
  
  // Ensure non-empty
  if (sanitized.length === 0) {
    return 'untitled'
  }
  
  return sanitized
}
