/**
 * Vergleichsfunktion für Distanz
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number}
 */
function comparison_dist(lon1, lat1, lon2, lat2) {
    var from = turf.point([lon1, lat1]);
    var to = turf.point([lon2, lat2]);

    var distance = turf.distance(from, to)
    return Math.round(distance*1000)/1000
}
/**
 * Vergleichsfunktion für Bearing
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number}
 */
function comparison_bear(lon1, lat1, lon2, lat2){
    var point1  = turf.point([lon1, lat1]);
    var point2 = turf.point([lon2, lat2]);
    var bearing = (turf.bearing(point1, point2)+360)%360; //Umrechnung in 360 Grad
    return Math.round(bearing*1000)/1000
}

/**
 * Tests für Distanz
 */
QUnit.test("Distanz", function (assert) {
    assert.equal(Math.round(distance(-75.343, 39.984, -75.534, 39.123 )*1000)/1000, comparison_dist(-75.343, 39.984, -75.534, 39.123), "Test 1 Passed");
    assert.equal(Math.round(distance(7.595737, 51.969508, 7.622795, 51.959817)*1000)/1000, comparison_dist(7.595737, 51.969508, 7.622795, 51.959817), "Test 2 Passed");
    assert.equal(Math.round(distance(7.595737, 51.969508, 7.633953, 51.966587)*1000)/1000, comparison_dist(7.595737, 51.969508, 7.633953, 51.966587), "Test 3 Passed");
    assert.equal(Math.round(distance(7.595737, 51.969508, 7.596016, 51.969336)*1000)/1000, comparison_dist(7.595737, 51.969508, 7.596016, 51.969336), "Test 4 Passed");
    assert.equal(Math.round(distance(7.595737, 51.969508, 7.587433, 51.948180)*1000)/1000, comparison_dist(7.595737, 51.969508, 7.587433, 51.948180), "Test 5 Passed");
})

/**
 * Tests für Bearing
 */
QUnit.test("Bearing", function (assert) {
    assert.equal(Math.round(bearing(-75.343, 39.984, -75.534, 39.123 )*1000)/1000, comparison_bear(-75.343, 39.984, -75.534, 39.123), "Test 1 Passed");
    assert.equal(Math.round(bearing(7.595737, 51.969508, 7.622795, 51.959817)*1000)/1000, comparison_bear(7.595737, 51.969508, 7.622795, 51.959817), "Test 2 Passed");
    assert.equal(Math.round(bearing(7.595737, 51.969508, 7.633953, 51.966587)*1000)/1000, comparison_bear(7.595737, 51.969508, 7.633953, 51.966587), "Test 3 Passed");
    assert.equal(Math.round(bearing(7.595737, 51.969508, 7.596016, 51.969336)*1000)/1000, comparison_bear(7.595737, 51.969508, 7.596016, 51.969336), "Test 4 Passed");
    assert.equal(Math.round(bearing(7.595737, 51.969508, 7.587433, 51.948180)*1000)/1000, comparison_bear(7.595737, 51.969508, 7.587433, 51.948180), "Test 5 Passed");
})



