export type Artifact = {
  id: string
  code: string
  title: string
  year: string
  description: string
  chapterId: string
  side: 'left' | 'right'
  z: number
}

export type ExhibitionType = 'desk' | 'journey-map' | 'document-case' | 'return-archive' | 'wall-timeline'

export type Transition = {
  entries: Array<{ text: string; z: number; side: 'left' | 'right' }>
}

export type Chapter = {
  id: string
  index: number
  period: string
  academicTitle: string
  museumCopy: string
  statement: string
  keywords: string[]
  side: 'left' | 'right'
  audio: string
  start: number
  end: number
  brightness: number
  artifacts: Artifact[]
  board: {
    side: 'left' | 'right'
    period: string
    title: string
    content: string
  }
  exhibition: {
    side: 'left' | 'right'
    type: ExhibitionType
  }
  transitionAfter: Transition
}

export const chapters: Chapter[] = [
  {
    id: 'stage-01', index: 1, period: 'TRƯỚC 05.06.1911', start: -2, end: -14, brightness: .45, side: 'left',
    academicTitle: 'HÌNH THÀNH TƯ TƯỞNG YÊU NƯỚC\nVÀ CHÍ HƯỚNG CỨU NƯỚC MỚI',
    museumCopy: 'Sinh ra và lớn lên trong một gia đình nhà Nho yêu nước, trên quê hương giàu truyền thống đấu tranh, Nguyễn Tất Thành sớm hình thành tình cảm yêu nước, thương dân.\n\nQua thực tế xã hội và sự thất bại của các phong trào cứu nước đương thời, Người nhận thấy cần tìm một hướng đi mới cho dân tộc. Từ đó dần hình thành chí hướng ra đi tìm con đường cứu nước.',
    statement: 'MỘT CON ĐƯỜNG MỚI\nCẦN ĐƯỢC TÌM THẤY.', keywords: ['QUÊ HƯƠNG', 'GIA ĐÌNH', 'YÊU NƯỚC', 'THƯƠNG DÂN'], audio: '/audio/01-before-1911.mp3',
    artifacts: [{ id: 'que-huong', code: 'TƯ LIỆU 01.01', title: 'QUÊ HƯƠNG NGHỆ AN', year: 'Đầu thế kỷ XX', description: 'Hình ảnh tư liệu đang được bổ sung.', chapterId: 'stage-01', side: 'right', z: -9 }],
    board: { side: 'left', period: 'TRƯỚC 05.06.1911', title: 'HÌNH THÀNH TƯ TƯỞNG YÊU NƯỚC\nVÀ CHÍ HƯỚNG CỨU NƯỚC MỚI', content: 'Sinh ra và lớn lên trong một gia đình nhà Nho yêu nước, trên quê hương giàu truyền thống đấu tranh, Nguyễn Tất Thành sớm hình thành tình cảm yêu nước, thương dân.\n\nQua thực tế xã hội và sự thất bại của các phong trào cứu nước đương thời, Người nhận thấy cần tìm một hướng đi mới cho dân tộc. Từ đó dần hình thành chí hướng ra đi tìm con đường cứu nước.' },
    exhibition: { side: 'right', type: 'desk' },
    transitionAfter: { entries: [{ text: 'MỘT CON ĐƯỜNG MỚI\nCẦN ĐƯỢC TÌM THẤY.', z: -15.5, side: 'left' }] }
  },
  {
    id: 'stage-02', index: 2, period: 'GIỮA 1911 - CUỐI 1920', start: -17, end: -31, brightness: .55, side: 'right',
    academicTitle: 'DẦN HÌNH THÀNH TƯ TƯỞNG CỨU NƯỚC,\nGIẢI PHÓNG DÂN TỘC THEO CON ĐƯỜNG\nCÁCH MẠNG VÔ SẢN',
    museumCopy: 'Từ năm 1911, Nguyễn Tất Thành đi qua nhiều quốc gia, lao động và trực tiếp quan sát đời sống của nhân dân lao động cũng như xã hội thuộc địa.\n\nNăm 1919, dưới tên Nguyễn Ái Quốc, Người gửi Yêu sách của nhân dân An Nam tới Hội nghị Versailles.\n\nNăm 1920, sau khi tiếp cận Luận cương của V.I. Lênin về vấn đề dân tộc và thuộc địa, Nguyễn Ái Quốc xác định con đường giải phóng dân tộc theo cách mạng vô sản.',
    statement: 'TỪ KHẢO NGHIỆM THỰC TIỄN\nĐẾN LỰA CHỌN CON ĐƯỜNG.', keywords: ['1911 · RA ĐI', '1919 · YÊU SÁCH CỦA NHÂN DÂN AN NAM', '1920 · BƯỚC NGOẶT TRONG NHẬN THỨC'], audio: '/audio/02-1911-1920.mp3',
    artifacts: [{ id: 'yeu-sach', code: 'TƯ LIỆU 02.01', title: 'YÊU SÁCH CỦA NHÂN DÂN AN NAM', year: '1919', description: 'Bản quét tài liệu đang được bổ sung.', chapterId: 'stage-02', side: 'left', z: -27 }],
    board: { side: 'right', period: 'GIỮA 1911 - CUỐI 1920', title: 'DẦN HÌNH THÀNH TƯ TƯỞNG CỨU NƯỚC,\nGIẢI PHÓNG DÂN TỘC THEO CON ĐƯỜNG\nCÁCH MẠNG VÔ SẢN', content: 'Từ năm 1911, Nguyễn Tất Thành đi qua nhiều quốc gia, lao động và trực tiếp quan sát đời sống của nhân dân lao động cũng như xã hội thuộc địa.\n\nNăm 1919, dưới tên Nguyễn Ái Quốc, Người gửi Yêu sách của nhân dân An Nam tới Hội nghị Versailles.\n\nNăm 1920, sau khi tiếp cận Luận cương của V.I. Lênin về vấn đề dân tộc và thuộc địa, Nguyễn Ái Quốc xác định con đường giải phóng dân tộc theo cách mạng vô sản.' },
    exhibition: { side: 'left', type: 'journey-map' },
    transitionAfter: { entries: [{ text: 'TỪ KHẢO NGHIỆM THỰC TIỄN\nĐẾN LỰA CHỌN CON ĐƯỜNG.', z: -32.5, side: 'right' }] }
  },
  {
    id: 'stage-03', index: 3, period: 'CUỐI 1920 - ĐẦU 1930', start: -34, end: -48, brightness: .48, side: 'left',
    academicTitle: 'HÌNH THÀNH NHỮNG NỘI DUNG CƠ BẢN\nCỦA TƯ TƯỞNG VỀ CÁCH MẠNG VIỆT NAM',
    museumCopy: 'Sau khi lựa chọn con đường cách mạng vô sản, Nguyễn Ái Quốc đẩy mạnh hoạt động lý luận, chính trị và tổ chức; truyền bá chủ nghĩa Mác – Lênin vào phong trào cách mạng Việt Nam.\n\nNhững quan điểm cơ bản về mục tiêu, lực lượng, tổ chức và phương pháp cách mạng từng bước được hình thành.\n\nĐầu năm 1930, Nguyễn Ái Quốc chủ trì việc hợp nhất các tổ chức cộng sản, dẫn tới sự ra đời của Đảng Cộng sản Việt Nam và Cương lĩnh chính trị đầu tiên.',
    statement: 'TỪ CON ĐƯỜNG ĐÃ CHỌN\nĐẾN ĐƯỜNG LỐI CÁCH MẠNG VIỆT NAM.', keywords: ['ĐỘC LẬP', 'ĐẢNG', 'NHÂN DÂN', 'ĐOÀN KẾT', 'QUỐC TẾ'], audio: '/audio/03-1920-1930.mp3',
    artifacts: [
      { id: 'ban-an', code: 'TƯ LIỆU 03.01', title: 'BẢN ÁN CHẾ ĐỘ THỰC DÂN PHÁP', year: '', description: 'Bản quét tài liệu đang được bổ sung.', chapterId: 'stage-03', side: 'right', z: -38 },
      { id: 'duong-kach-menh', code: 'TƯ LIỆU 03.02', title: 'ĐƯỜNG KÁCH MỆNH', year: '1927', description: 'Bản quét tài liệu đang được bổ sung.', chapterId: 'stage-03', side: 'right', z: -41 },
      { id: 'cuong-linh', code: 'TƯ LIỆU 03.03', title: 'CƯƠNG LĨNH CHÍNH TRỊ ĐẦU TIÊN', year: '1930', description: 'Bản quét tài liệu đang được bổ sung.', chapterId: 'stage-03', side: 'right', z: -44 }
    ],
    board: { side: 'left', period: 'CUỐI 1920 - ĐẦU 1930', title: 'HÌNH THÀNH NHỮNG NỘI DUNG CƠ BẢN\nCỦA TƯ TƯỞNG VỀ CÁCH MẠNG VIỆT NAM', content: 'Sau khi lựa chọn con đường cách mạng vô sản, Nguyễn Ái Quốc đẩy mạnh hoạt động lý luận, chính trị và tổ chức; truyền bá chủ nghĩa Mác – Lênin vào phong trào cách mạng Việt Nam.\n\nNhững quan điểm cơ bản về mục tiêu, lực lượng, tổ chức và phương pháp cách mạng từng bước được hình thành.\n\nĐầu năm 1930, Nguyễn Ái Quốc chủ trì việc hợp nhất các tổ chức cộng sản, dẫn tới sự ra đời của Đảng Cộng sản Việt Nam và Cương lĩnh chính trị đầu tiên.' },
    exhibition: { side: 'right', type: 'document-case' },
    transitionAfter: { entries: [{ text: 'TỪ CON ĐƯỜNG ĐÃ CHỌN\nĐẾN ĐƯỜNG LỐI CÁCH MẠNG VIỆT NAM.', z: -49.5, side: 'left' }] }
  },
  {
    id: 'stage-04', index: 4, period: 'ĐẦU 1930 - ĐẦU 1941', start: -51, end: -64, brightness: .25, side: 'right',
    academicTitle: 'VƯỢT QUA THỬ THÁCH,\nGIỮ VỮNG ĐƯỜNG LỐI, PHƯƠNG PHÁP\nCÁCH MẠNG VIỆT NAM ĐÚNG ĐẮN, SÁNG TẠO',
    museumCopy: 'Những năm 1930 đặt cách mạng Việt Nam trước nhiều khó khăn và thử thách. Có thời điểm, một số quan điểm của Nguyễn Ái Quốc về vấn đề dân tộc và lực lượng cách mạng chưa được nhận thức đầy đủ.\n\nNgười tiếp tục nghiên cứu, hoạt động và theo dõi sát thực tiễn Việt Nam cũng như thế giới.\n\nTrước những biến động cuối thập niên 1930, yêu cầu đặt giải phóng dân tộc lên hàng đầu ngày càng được khẳng định trong thực tiễn cách mạng.',
    statement: 'THỬ THÁCH.\n\nKIÊN ĐỊNH.', keywords: ['1941', 'TRỞ VỀ TỔ QUỐC'], audio: '/audio/04-1930-1941.mp3',
    artifacts: [{ id: 'pac-bo', code: 'TƯ LIỆU 04.01', title: 'PÁC BÓ', year: '1941', description: 'Hình ảnh tư liệu đang được bổ sung.', chapterId: 'stage-04', side: 'left', z: -58 }],
    board: { side: 'right', period: 'ĐẦU 1930 - ĐẦU 1941', title: 'VƯỢT QUA THỬ THÁCH,\nGIỮ VỮNG ĐƯỜNG LỐI, PHƯƠNG PHÁP\nCÁCH MẠNG VIỆT NAM ĐÚNG ĐẮN, SÁNG TẠO', content: 'Những năm 1930 đặt cách mạng Việt Nam trước nhiều khó khăn và thử thách. Có thời điểm, một số quan điểm của Nguyễn Ái Quốc về vấn đề dân tộc và lực lượng cách mạng chưa được nhận thức đầy đủ.\n\nNgười tiếp tục nghiên cứu, hoạt động và theo dõi sát thực tiễn Việt Nam cũng như thế giới.\n\nTrước những biến động cuối thập niên 1930, yêu cầu đặt giải phóng dân tộc lên hàng đầu ngày càng được khẳng định trong thực tiễn cách mạng.' },
    exhibition: { side: 'left', type: 'return-archive' },
    transitionAfter: { entries: [{ text: 'THỬ THÁCH.', z: -65.5, side: 'right' }, { text: 'KIÊN ĐỊNH.', z: -66.8, side: 'left' }, { text: '1941\nTRỞ VỀ TỔ QUỐC', z: -67.8, side: 'right' }] }
  },
  {
    id: 'stage-05', index: 5, period: 'ĐẦU 1941 - THÁNG 9.1969', start: -67, end: -86, brightness: .6, side: 'left',
    academicTitle: 'TƯ TƯỞNG HỒ CHÍ MINH TIẾP TỤC\nPHÁT TRIỂN, HOÀN THIỆN, SOI ĐƯỜNG\nCHO SỰ NGHIỆP CÁCH MẠNG CỦA ĐẢNG\nVÀ NHÂN DÂN TA',
    museumCopy: 'Từ năm 1941, Hồ Chí Minh trực tiếp cùng Trung ương Đảng lãnh đạo cách mạng Việt Nam.\n\nTrong thực tiễn đấu tranh giành và bảo vệ độc lập, kháng chiến, xây dựng đất nước và đấu tranh thống nhất dân tộc, tư tưởng Hồ Chí Minh tiếp tục được bổ sung và phát triển.\n\nNhiều vấn đề về độc lập dân tộc, xây dựng xã hội mới, Nhà nước, nhân dân, đại đoàn kết, đạo đức, văn hóa và con người ngày càng được thể hiện đầy đủ hơn.',
    statement: 'MỘT HÀNH TRÌNH KHÉP LẠI.\nMỘT DI SẢN TƯ TƯỞNG TIẾP TỤC.', keywords: ['1941 · GIẢI PHÓNG DÂN TỘC', '1945 · CÁCH MẠNG THÁNG TÁM', '02 · 09 · 1945 · TUYÊN NGÔN ĐỘC LẬP', '1946 - 1954 · BẢO VỆ ĐỘC LẬP', '1954 - 1969 · XÂY DỰNG VÀ THỐNG NHẤT'], audio: '/audio/05-1941-1969.mp3',
    artifacts: [{ id: 'di-chuc', code: 'TƯ LIỆU 05.01', title: 'DI CHÚC', year: '1969', description: 'Bản quét tài liệu lưu trữ đang được bổ sung. Không hiển thị nội dung viết tay thay thế.', chapterId: 'stage-05', side: 'right', z: -84 }],
    board: { side: 'left', period: 'ĐẦU 1941 - THÁNG 9.1969', title: 'TƯ TƯỞNG HỒ CHÍ MINH TIẾP TỤC\nPHÁT TRIỂN, HOÀN THIỆN, SOI ĐƯỜNG\nCHO SỰ NGHIỆP CÁCH MẠNG CỦA ĐẢNG\nVÀ NHÂN DÂN TA', content: 'Từ năm 1941, Hồ Chí Minh trực tiếp cùng Trung ương Đảng lãnh đạo cách mạng Việt Nam.\n\nTrong thực tiễn đấu tranh giành và bảo vệ độc lập, kháng chiến, xây dựng đất nước và đấu tranh thống nhất dân tộc, tư tưởng Hồ Chí Minh tiếp tục được bổ sung và phát triển.\n\nNhiều vấn đề về độc lập dân tộc, xây dựng xã hội mới, Nhà nước, nhân dân, đại đoàn kết, đạo đức, văn hóa và con người ngày càng được thể hiện đầy đủ hơn.' },
    exhibition: { side: 'right', type: 'wall-timeline' },
    transitionAfter: { entries: [{ text: 'MỘT HÀNH TRÌNH KHÉP LẠI.', z: -87.5, side: 'left' }, { text: 'MỘT DI SẢN TƯ TƯỞNG TIẾP TỤC.', z: -90.5, side: 'right' }] }
  }
]

export const exhibitionContent = {
  prologue: {
    lead: 'MỘT TƯ TƯỞNG\nKHÔNG HÌNH THÀNH\nTRONG MỘT NGÀY.\n\nĐó là kết quả của một hành trình.',
    stages: '05 GIAI ĐOẠN\n\nQuá trình hình thành và phát triển\nTư tưởng Hồ Chí Minh',
    audio: '/audio/00-introduction.mp3'
  },
  map: {
    labels: 'SÀI GÒN · 1911                                    PARIS · 1920\n\nHÀNH TRÌNH TÌM ĐƯỜNG CỨU NƯỚC'
  },
  finalHall: {
    title: 'TƯ TƯỞNG\nHỒ CHÍ MINH',
    definition: 'Một hệ thống quan điểm toàn diện và sâu sắc\nvề những vấn đề cơ bản của cách mạng Việt Nam.',
    themes: [
      { title: 'ĐỘC LẬP', subtitle: 'DÂN TỘC & CHỦ NGHĨA XÃ HỘI', copy: 'Giải phóng dân tộc, giành độc lập và xây dựng một xã hội mới là những vấn đề xuyên suốt trong tư tưởng Hồ Chí Minh.' },
      { title: 'NHÂN DÂN', subtitle: 'ĐẢNG · NHÀ NƯỚC · NHÂN DÂN', copy: 'Nhân dân là lực lượng to lớn của cách mạng; tổ chức lãnh đạo và Nhà nước phải gắn bó với nhân dân, phát huy quyền làm chủ và hướng tới lợi ích của nhân dân.' },
      { title: 'ĐOÀN KẾT', subtitle: 'DÂN TỘC · QUỐC TẾ', copy: 'Đại đoàn kết toàn dân tộc là nguồn sức mạnh quan trọng của cách mạng, đồng thời cần kết hợp sức mạnh dân tộc với sức mạnh của thời đại.' },
      { title: 'CON NGƯỜI', subtitle: 'VĂN HÓA · ĐẠO ĐỨC · CON NGƯỜI', copy: 'Con người vừa là mục tiêu, vừa là động lực của sự nghiệp cách mạng; văn hóa và đạo đức giữ vị trí quan trọng trong quá trình xây dựng xã hội.' }
    ],
    closing: 'MỖI THỜI ĐẠI\nĐỀU ĐẶT RA\nNHỮNG CÂU HỎI MỚI.',
    question: 'Thế hệ hôm nay sẽ đóng góp như thế nào\nvào hành trình phát triển của đất nước?',
    audio: '/audio/06-conclusion.mp3'
  },
  credits: {
    project: 'BẢO TÀNG TƯ TƯỞNG HỒ CHÍ MINH',
    subtitle: 'Bảo tàng ảo về quá trình hình thành và phát triển Tư tưởng Hồ Chí Minh',
    course: '[BỔ SUNG]',
    team: '[BỔ SUNG]',
    lecturer: '[BỔ SUNG]',
    source: 'Giáo trình Tư tưởng Hồ Chí Minh\nBộ Giáo dục và Đào tạo, 2019'
  }
} as const

export const narrationPaths = [
  exhibitionContent.prologue.audio,
  ...chapters.map((chapter) => chapter.audio),
  exhibitionContent.finalHall.audio
]
