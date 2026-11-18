-- Table to store movie data
CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year TEXT,
    genre TEXT,
    cast_members TEXT,
    director TEXT,
    poster TEXT,
    synopsis TEXT,
    streaming_info TEXT,
    video_source TEXT,
    screenshots TEXT,
    imdb_rating TEXT,
    writer TEXT,
    language TEXT,
    quality TEXT,
    format TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reset table content for the migration (optional)
-- TRUNCATE TABLE movies;

-- Insert movie data
INSERT INTO movies (id, title, year, genre, cast_members, director, poster, synopsis, streaming_info, video_source) VALUES
('telusu-kada', 'Telusu Kada', '2024', 'Action / Thriller', 'Naveen Polishetty, Anjali, Priyadarshi', 'Vivek Athreya', 'https://upload.wikimedia.org/wikipedia/en/a/ae/Telusu_Kada.jpg', 'Telusu Kada is an action-packed thriller that follows the journey of a young man who gets entangled in a web of crime and mystery.', 'Telusu Kada movie in Telugu streaming in HD Quality.', 'https://ww7.vcdnlare.com/v/V5SeGgK6AumYnvf?sid=7238&t=hls'),
('kaantha', 'Kaantha', '2024', 'Drama / Romance', 'Sai Pallavi, Naga Chaitanya, Priyamani', 'Sekhar Kammula', 'https://upload.wikimedia.org/wikipedia/en/9/91/Kaantha.jpg', 'Kaantha is a heartwarming drama that explores the complexities of relationships and love.', 'Kaantha movie in Telugu streaming in HD Quality.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'),
('k-ramp', 'K-Ramp', '2024', 'Action / Crime', 'Ravi Teja, Sreeleela, Jayaram', 'Gopichand Malineni', 'https://upload.wikimedia.org/wikipedia/en/4/46/K-Ramp.jpg', 'K-Ramp is a high-octane action thriller that follows a fearless cop who takes on a dangerous criminal organization.', 'K-Ramp movie in Telugu streaming in HD Quality.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'),
('dude', 'Dude', '2024', 'Comedy / Drama', 'Vijay Deverakonda, Rashmika Mandanna', 'Puri Jagannadh', 'https://imgs.search.brave.com/jnPIXuoYFRMPpiPCZvD6Uoo-jyvWAwQnpWyvTUB91rA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vd2dsR3FW/NWZDVGZ6emNVZHZp/WHFCZzFqc25ZZEtQ/OVJiS2ZRclFlR3Jn/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTl3/Y21WMi9hV1YzTG5K/bFpHUXVhWFF2L1pI/VmtaUzF5WlhacFpY/Y3QvYldWbllYUm9j/bVZoWkMxMi9NQzFr/T1hSeFlqRjBOSFpu/L2RtWXhMbXB3Wldj/X2QybGsvZEdnOU5q/UXdKbU55YjNBOS9j/MjFoY25RbVlYVjBi/ejEzL1pXSndKbk05/TWpWa05EVTAvTVRk/aE5UVXlNbUV5WVdV/Mi9NekZpTmpnNU1U/TXhaV1k1L01XRTNP/REUzTURNMk5R', 'Dude is a coming-of-age comedy-drama that follows the life of a carefree young man.', 'Dude movie in Telugu streaming in HD Quality.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'),
('vikkatakavi', 'Vikkatakavi', '2024', 'Drama / Biography', 'Nani, Keerthy Suresh, Prakash Raj', 'Krishna Vamsi', 'https://imgs.search.brave.com/qpRqyYr8Y_T-8qE7_x6V6glhCobiJ4AtuOtjW4rwCQg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvZW4vZi9mZC9W/aWtrYXRha2F2aS5q/cGVn', 'Vikkatakavi is an inspiring biographical drama that tells the story of a legendary poet.', 'Vikkatakavi movie in Telugu streaming in HD Quality.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'),
('mithra-mandali', 'Mithra Mandali', '2025', 'Action / Thriller', 'Allu Arjun, Pooja Hegde, Fahadh Faasil', 'Trivikram Srinivas', 'https://imgs.search.brave.com/onNcOmctUaPvCN9dwT4Rp8MXEyCL2h-boLsGFfzSjiQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5yYWdhbGFoYXJp/LmNvbS9uZXdzL2p1/bjIwMjUvbWl0aHJh/LW1hbmRhbGktZmly/c3QtbG9vay1wb3N0/ZXItb3V0LWp1bjYu/anBn', 'Mithra Mandali is an action-packed thriller that follows a group of friends.', 'Mithra Mandali movie in Telugu streaming in HD Quality.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    year = EXCLUDED.year,
    genre = EXCLUDED.genre,
    cast_members = EXCLUDED.cast_members,
    director = EXCLUDED.director,
    poster = EXCLUDED.poster,
    synopsis = EXCLUDED.synopsis,
    streaming_info = EXCLUDED.streaming_info,
    video_source = EXCLUDED.video_source,
    screenshots = EXCLUDED.screenshots,
    imdb_rating = EXCLUDED.imdb_rating,
    writer = EXCLUDED.writer,
    language = EXCLUDED.language,
    quality = EXCLUDED.quality,
    format = EXCLUDED.format;
    
-- Table to store admin credentials
CREATE TABLE IF NOT EXISTS admin_users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
);

-- Insert fixed admin details (admin / admin123)
INSERT INTO admin_users (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;
