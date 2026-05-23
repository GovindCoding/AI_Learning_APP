import mysql.connector
import sys
import re

def split_sql_statements(content):
    statements = []
    current = []
    in_single_quote = False
    in_double_quote = False
    escaped = False
    for char in content:
        if escaped:
            current.append(char)
            escaped = False
            continue
        if char == '\\':
            current.append(char)
            escaped = True
            continue
        if char == "'" and not in_double_quote:
            in_single_quote = not in_single_quote
        elif char == '"' and not in_single_quote:
            in_double_quote = not in_double_quote
        
        if char == ';' and not in_single_quote and not in_double_quote:
            statements.append(''.join(current))
            current = []
        else:
            current.append(char)
            
    if current:
        statements.append(''.join(current))
    return statements

def run_sql_file(cursor, connection, filename):
    print(f"Executing: {filename}")
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'--.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    statements = split_sql_statements(content)
    
    success_count = 0
    ignored_count = 0
    for stmt in statements:
        stmt = stmt.strip()
        if not stmt:
            continue
        try:
            cursor.execute(stmt)
            success_count += 1
        except mysql.connector.Error as err:
            # 1060: Duplicate column name, 1061: Duplicate key name, 1050: Table already exists, 1062: Duplicate entry
            if err.errno in (1060, 1061, 1050, 1062):
                ignored_count += 1
            else:
                print(f"Error executing statement near '{stmt[:100]}...': {err}")
                connection.rollback()
                sys.exit(1)
    connection.commit()
    print(f"Successfully processed: {filename} (Executed: {success_count}, Ignored Duplicates: {ignored_count})")

def main():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="admin1234",
            autocommit=False
        )
        cursor = conn.cursor()
        run_sql_file(cursor, conn, "d:/Antigravity_Workspace/AI_Learning_APP/database/news_delta.sql")
        run_sql_file(cursor, conn, "d:/Antigravity_Workspace/AI_Learning_APP/database/social_delta.sql")
        run_sql_file(cursor, conn, "d:/Antigravity_Workspace/AI_Learning_APP/database/google_ai_delta.sql")
        cursor.close()
        conn.close()
        print("Delta migrations (news, social, & google_ai) completed successfully!")
    except mysql.connector.Error as err:
        print(f"Failed to connect to MySQL: {err}")
        sys.exit(1)

if __name__ == "__main__":
    main()
