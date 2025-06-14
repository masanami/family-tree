-- 家系図テーブル
CREATE TABLE family_trees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 人物テーブル
CREATE TABLE persons (
    id TEXT PRIMARY KEY,
    family_tree_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE,
    death_date DATE,
    gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
    photo_url TEXT,
    occupation TEXT,
    location TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_tree_id) REFERENCES family_trees(id) ON DELETE CASCADE
);

-- 関係性テーブル
CREATE TABLE relationships (
    id TEXT PRIMARY KEY,
    family_tree_id TEXT NOT NULL,
    from_person_id TEXT NOT NULL,
    to_person_id TEXT NOT NULL,
    relationship_type TEXT CHECK(relationship_type IN ('parent', 'child', 'spouse')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_tree_id) REFERENCES family_trees(id) ON DELETE CASCADE,
    FOREIGN KEY (from_person_id) REFERENCES persons(id) ON DELETE CASCADE,
    FOREIGN KEY (to_person_id) REFERENCES persons(id) ON DELETE CASCADE,
    UNIQUE(from_person_id, to_person_id, relationship_type)
);

-- インデックス
CREATE INDEX idx_persons_family_tree_id ON persons(family_tree_id);
CREATE INDEX idx_relationships_family_tree_id ON relationships(family_tree_id);
CREATE INDEX idx_relationships_from_person_id ON relationships(from_person_id);
CREATE INDEX idx_relationships_to_person_id ON relationships(to_person_id);

-- 更新日時の自動更新トリガー
CREATE TRIGGER update_family_trees_updated_at 
AFTER UPDATE ON family_trees
BEGIN
    UPDATE family_trees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_persons_updated_at 
AFTER UPDATE ON persons
BEGIN
    UPDATE persons SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_relationships_updated_at 
AFTER UPDATE ON relationships
BEGIN
    UPDATE relationships SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;