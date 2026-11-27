"""
Selenium End-to-End Test Suite for QuizMaster
Covers:
1. Student Login
2. Admin Quiz Creation
3. Student Quiz Participation
4. Quiz Submission
5. Result Viewing

Run locally after starting `npm run dev` and configuring test accounts via env vars:
  pip install selenium
  QUIZMASTER_URL=http://localhost:5173 python3 tests/e2e/quizmaster_e2e.py
"""

import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.getenv("QUIZMASTER_URL", "http://localhost:5173")
STUDENT_EMAIL = os.getenv("TEST_STUDENT_EMAIL", "student@ruet.ac.bd")
STUDENT_PASS = os.getenv("TEST_STUDENT_PASS", "password123")
ADMIN_EMAIL = os.getenv("TEST_ADMIN_EMAIL", "admin@ruet.ac.bd")
ADMIN_PASS = os.getenv("TEST_ADMIN_PASS", "admin123")


def create_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,800")
    return webdriver.Chrome(options=options)


def login(driver, email: str, password: str):
    driver.get(f"{BASE_URL}/login")
    wait = WebDriverWait(driver, 10)
    wait.until(EC.presence_of_element_located((By.ID, "email"))).send_keys(email)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()


def test_admin_create_quiz(driver):
    login(driver, ADMIN_EMAIL, ADMIN_PASS)
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/dashboard"))
    driver.get(f"{BASE_URL}/admin/quizzes/new")
    wait.until(EC.presence_of_element_located((By.NAME, "title"))).send_keys("Selenium E2E Quiz")
    driver.find_element(By.NAME, "description").send_keys("Automated browser test quiz")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    wait.until(EC.url_contains("/admin/quizzes"))


def test_student_take_and_submit_quiz(driver):
    login(driver, STUDENT_EMAIL, STUDENT_PASS)
    wait = WebDriverWait(driver, 10)
    wait.until(EC.url_contains("/student/dashboard"))
    driver.get(f"{BASE_URL}/student/quizzes")
    view_btn = wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "View Details")))
    view_btn.click()

    start_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Start Quiz')]")))
    start_btn.click()

    wait.until(EC.url_contains("/student/attempts/"))
    first_radio = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='radio']")))
    first_radio.click()
    time.sleep(0.5)

    submit_btn = driver.find_element(By.XPATH, "//button[contains(., 'Submit Quiz')]")
    submit_btn.click()
    confirm_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Submit Now')]")))
    confirm_btn.click()

    wait.until(EC.url_contains("/student/results/"))
    assert "Quiz Result Summary" in driver.page_source


if __name__ == "__main__":
    browser = create_driver()
    try:
        test_admin_create_quiz(browser)
        test_student_take_and_submit_quiz(browser)
        print("All Selenium E2E tests passed!")
    finally:
        browser.quit()
