import requests
import json

BASE_URL = 'https://befluent-sms.onrender.com/api'

def get_token(email, password):
    """Get JWT token for authentication"""
    response = requests.post(f'{BASE_URL}/token/', json={
        'email': email,
        'password': password
    })
    if response.status_code == 200:
        return response.json()['access']
    raise Exception(f"Failed to get token: {response.json()}")

def get_first_teacher(headers):
    """Get the first available teacher"""
    response = requests.get(f'{BASE_URL}/students/teachers/', headers=headers)
    if response.status_code == 200 and response.json():
        return response.json()[0]['id']
    raise Exception("No teachers found in the system")

def get_students(headers, limit=3):
    """Get a list of student IDs"""
    response = requests.get(f'{BASE_URL}/students/students/', headers=headers)
    if response.status_code == 200 and response.json():
        students = response.json()[:limit]
        return [student['id'] for student in students]
    raise Exception("No students found in the system")

def test_groups_api():
    # Get authentication token
    token = get_token('admin@example.com', 'admin123')
    
    # Headers with token
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }

    # Get existing teacher and student IDs
    print("\n=== Getting Test Data ===")
    teacher_id = get_first_teacher(headers)
    print(f"Using teacher with ID: {teacher_id}")
    student_ids = get_students(headers, limit=3)
    print(f"Using students with IDs: {student_ids}")
    
    # Test data
    test_group = {
        'name': 'Test English Group',
        'max_capacity': 10,
        'status': 'active',
        'teacher': teacher_id
    }

    print("\n=== Testing Groups API ===")

    # 1. Get all groups
    print("\n1. Getting all groups...")
    response = requests.get(f'{BASE_URL}/students/groups/', headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code != 204:
        print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 2. Create a group
    print("\n2. Creating a new group...")
    group_data = {
        'name': 'Test Group',
        'description': 'A test group for learning English',
        'language': 'English',
        'level': 'Intermediate',
        'max_capacity': 10
    }
    response = requests.post(f'{BASE_URL}/students/groups/', json=group_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        group_id = response.json()['id']
        print(f"Created group with ID: {group_id}")
    else:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return

    # 3. Get group by ID
    print(f"\n3. Getting group {group_id}...")
    response = requests.get(f'{BASE_URL}/students/groups/{group_id}/', headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code != 204:
        print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 4. Add multiple students to group
    print(f"\n4. Adding multiple students to group {group_id}...")
    add_students_data = {
        'student_ids': student_ids
    }
    response = requests.post(f'{BASE_URL}/students/groups/{group_id}/add_students/', json=add_students_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 5. Create schedule and assign teacher
    print(f"\n5. Creating schedule and assigning teacher to group {group_id}...")
    schedule_data = {
        'teacher_id': teacher_id,
        'schedule': {
            'days': [0, 2, 4],  # Monday, Wednesday, Friday
            'start_time': '14:00',
            'end_time': '15:30'
        }
    }
    response = requests.post(f'{BASE_URL}/students/groups/{group_id}/assign_teacher/', json=schedule_data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code != 204:
        print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 6. Remove students from group
    print(f"\n6. Removing students from group {group_id}...")
    for student_id in student_ids:
        remove_student_data = {
            'student_id': student_id
        }
        response = requests.post(f'{BASE_URL}/students/groups/{group_id}/remove_student/', json=remove_student_data, headers=headers)
        print(f"Status for student {student_id}: {response.status_code}")
        if response.status_code != 204:
            print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 7. Delete group
    print(f"\n7. Deleting group {group_id}...")
    response = requests.delete(f'{BASE_URL}/students/groups/{group_id}/', headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code != 204:
        print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == '__main__':
    test_groups_api()