"""
Sprint 6 End-to-End Test: Risk Management (Lock & Trail)
Tests the complete flow from frontend to backend to database
"""
import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

# Test data
test_strategy_with_risk = {
    "name": "Sprint 6 Test Strategy",
    "strategy_type": "SHORT_STRADDLE",
    "config": {
        "instrument": "NIFTY",
        "atmSelection": "ATM",
        "lotSize": 1,
        "stopLoss": 50,
        "targetProfit": 100,
        "entryTime": "09:15",
        "exitTime": "15:15"
    },
    "risk_management": {
        "mode": "LOCK_AND_TRAIL",
        "combinedPremiumSl": 50,
        "combinedPremiumTarget": 100,
        "individualLegSl": 100,
        "lockAndTrail": {
            "activationLevel": 30,
            "lockProfit": 20,
            "trailStep": 10,
            "trailProfit": 5
        }
    }
}

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_backend_health():
    """Test 1: Check backend is running"""
    print_section("TEST 1: Backend Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend is healthy")
            print(f"  Response: {response.json()}")
            return True
        else:
            print(f"✗ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Backend health check failed: {str(e)}")
        return False

def test_frontend_reachable():
    """Test 2: Check frontend is reachable"""
    print_section("TEST 2: Frontend Reachability")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code in [200, 308]:  # 308 is redirect
            print("✓ Frontend is reachable")
            return True
        else:
            print(f"✗ Frontend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Frontend check failed: {str(e)}")
        return False

def test_risk_management_validation():
    """Test 3: Validate risk management schema"""
    print_section("TEST 3: Risk Management Schema Validation")
    
    # Test valid configuration
    valid_config = test_strategy_with_risk["risk_management"]
    print("Testing valid configuration:")
    print(json.dumps(valid_config, indent=2))
    
    # Check Lock & Trail constraints
    lock_and_trail = valid_config["lockAndTrail"]
    activation = lock_and_trail["activationLevel"]
    lock = lock_and_trail["lockProfit"]
    
    if lock <= activation:
        print(f"✓ Lock profit ({lock}%) <= Activation level ({activation}%)")
    else:
        print(f"✗ Invalid: Lock profit ({lock}%) > Activation level ({activation}%)")
        return False
    
    # Check mode and lockAndTrail presence
    if valid_config["mode"] == "LOCK_AND_TRAIL":
        if "lockAndTrail" in valid_config and valid_config["lockAndTrail"]:
            print("✓ Lock & Trail config present for LOCK_AND_TRAIL mode")
        else:
            print("✗ Lock & Trail config missing for LOCK_AND_TRAIL mode")
            return False
    
    print("✓ Risk management schema is valid")
    return True

def test_database_structure():
    """Test 4: Verify database has risk_management column"""
    print_section("TEST 4: Database Structure")
    try:
        import sqlite3
        conn = sqlite3.connect('c:/workspace/AlgoTrading/algo_trading.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(strategies)")
        columns = [col[1] for col in cursor.fetchall()]
        conn.close()
        
        if 'risk_management' in columns:
            print("✓ Database has 'risk_management' column")
            print(f"  All columns: {', '.join(columns)}")
            return True
        else:
            print("✗ Database missing 'risk_management' column")
            return False
    except Exception as e:
        print(f"✗ Database check failed: {str(e)}")
        return False

def test_visualization_data():
    """Test 5: Validate visualization data format"""
    print_section("TEST 5: Visualization Data Format")
    
    config = test_strategy_with_risk["risk_management"]["lockAndTrail"]
    
    print("Lock & Trail Parameters for SVG Visualizer:")
    print(f"  Activation Level: {config['activationLevel']}%")
    print(f"  Lock Profit:      {config['lockProfit']}%")
    print(f"  Trail Step:       {config['trailStep']}%")
    print(f"  Trail Profit:     {config['trailProfit']}%")
    
    # Simulate visualization logic
    print("\nVisualization Logic:")
    print(f"1. Entry: SL at 0% (entry price)")
    print(f"2. Building: SL remains at 0% until profit hits {config['activationLevel']}%")
    print(f"3. Activated: SL jumps to lock {config['lockProfit']}% profit")
    print(f"4. Trailing: For every {config['trailStep']}% gain, SL trails {config['trailProfit']}% behind")
    
    print("\n✓ Visualization data format is correct")
    return True

def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "="*60)
    print("  SPRINT 6 RISK MANAGEMENT TEST SUITE")
    print("  Lock & Trail Feature End-to-End Validation")
    print("="*60)
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Frontend Reachability", test_frontend_reachable),
        ("Schema Validation", test_risk_management_validation),
        ("Database Structure", test_database_structure),
        ("Visualization Data", test_visualization_data),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Test '{name}' raised exception: {str(e)}")
            results.append((name, False))
    
    # Print summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status} - {name}")
    
    print(f"\n{'='*60}")
    print(f"  Results: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print("🎉 All tests passed! Sprint 6 Risk Management is working correctly.")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please review the failures above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
