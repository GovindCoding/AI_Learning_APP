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
    
    # Remove single line comments
    content = re.sub(r'--.*$', '', content, flags=re.MULTILINE)
    # Remove block comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Split by semicolon using state machine
    statements = split_sql_statements(content)
    
    try:
        for stmt in statements:
            stmt = stmt.strip()
            if not stmt:
                continue
            
            cursor.execute(stmt)
            
        connection.commit()
        print(f"Successfully executed: {filename}")
    except mysql.connector.Error as err:
        print(f"Error executing {filename} near statement '{stmt[:100]}...': {err}")
        connection.rollback()
        sys.exit(1)

def main():
    try:
        # Connect to MySQL
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="admin1234",
            autocommit=False
        )
        cursor = conn.cursor()
        
        # Run schema.sql and seed.sql
        run_sql_file(cursor, conn, "d:/Antigravity_Workspace/AI_Learning_APP/database/schema.sql")
        run_sql_file(cursor, conn, "d:/Antigravity_Workspace/AI_Learning_APP/database/seed.sql")
        
        cursor.close()
        conn.close()
        print("Database initialization completed successfully!")
        
    except mysql.connector.Error as err:
        print(f"Failed to connect to MySQL: {err}")
        sys.exit(1)

if __name__ == "__main__":
    main()
