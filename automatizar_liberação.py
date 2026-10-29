import pyautogui as py
import time

for enter in range(1, 10000):
    py.press("enter")
    print(f"enter numero {enter}")
    time.sleep(5)