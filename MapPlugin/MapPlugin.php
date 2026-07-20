<?php
/**
 * Plugin Name: MapPlugin
 * Description: Displays an interactive Leaflet map using a shortcode. Data pulled from a public Google Sheet.
 */

// ── Shortcode ────────────────────────────────────────────────────────────────

add_shortcode('interactive_map', 'interactive_map_shortcode');

function interactive_map_shortcode() {
    return '
    <div class="map-plugin-wrapper">
        <div class="map-plugin-header">
            <h2 class="map-plugin-title">OMS Patients By Country</h2>
        </div>
        <div id="interactive-map"></div>
    </div>
    <p class="map-plugin-attribution">Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a></p>
    <div class="map-plugin-disclaimer">
        The information presented on this map is based primarily on patient utilization patterns and reflects locations where larger numbers of patients have received care. It may also include institutions where physicians are recognized by their peers as experienced medical professionals in the treatment of OMAS. Inclusion does not imply any recommendation, endorsement, or assessment of the quality, effectiveness, or suitability of any institution, physician, or healthcare provider. Users are encouraged to conduct their own research and consult qualified professionals when making healthcare decisions.
    </div>';
}

// ── Enqueue assets + pass sheet data to JS ───────────────────────────────────

add_action('wp_enqueue_scripts', 'map_plugin_assets_enqueue');

function map_plugin_assets_enqueue() {
    wp_enqueue_style('leaflet-css', 'https://unpkg.com/leaflet/dist/leaflet.css');
    wp_enqueue_style('plugin-css', plugin_dir_url(__FILE__) . 'assets/css/plugin.css');

    wp_enqueue_script('leaflet-js', 'https://unpkg.com/leaflet/dist/leaflet.js', array(), null, true);

    wp_enqueue_script(
        'MapPlugin-js',
        plugin_dir_url(__FILE__) . 'assets/js/MapPlugin.js',
        array('leaflet-js'),
        '1.3',
        true
    );

    wp_localize_script('MapPlugin-js', 'MapPluginData', array(
        'features'    => map_plugin_get_sheet_data(),
        'specialists' => map_plugin_get_specialists_data()
    ));
}

// ── Fetch + parse Google Sheet CSV ───────────────────────────────────────────

function map_plugin_get_sheet_data() {
    $cached = get_transient('map_plugin_sheet_data');
    if ($cached !== false) return $cached;

    $sheet_url = get_option('map_plugin_sheet_url', '');
    if (empty($sheet_url)) return array();

    if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $sheet_url, $matches)) {
        $sheet_id = $matches[1];
    } else {
        $sheet_id = trim($sheet_url);
    }

    $csv_url  = 'https://docs.google.com/spreadsheets/d/' . $sheet_id . '/export?format=csv';
    $response = wp_remote_get($csv_url, array('timeout' => 10));

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return array();
    }

    $body = wp_remote_retrieve_body($response);
    $rows = array_map('str_getcsv', explode("\n", trim($body)));
    $header = array_map('strtolower', array_map('trim', array_shift($rows)));

    $features = array();
    foreach ($rows as $row) {
        if (count($row) < 4) continue;
        $data = array_combine($header, array_map('trim', $row));

        $lat  = isset($data['lat'])  ? floatval($data['lat'])  : 0;
        $lng  = isset($data['lng'])  ? floatval($data['lng'])  : 0;
        $name = isset($data['name']) ? trim($data['name'])     : '';
        if ($lat === 0.0 && $lng === 0.0) continue;

        $features[] = array(
            'name'  => $name,
            'count' => isset($data['count']) ? intval($data['count']) : 0,
            'lat'   => $lat,
            'lng'   => $lng,
        );
    }

    set_transient('map_plugin_sheet_data', $features, HOUR_IN_SECONDS);
    return $features;
}

// ── Fetch + parse specialists Google Sheet CSV ───────────────────────────────

function map_plugin_get_specialists_data() {
    $cached = get_transient('map_plugin_specialists_data');
    if ($cached !== false) return $cached;

    $sheet_url = get_option('map_plugin_specialists_sheet_url', '');
    if (empty($sheet_url)) return array();

    if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $sheet_url, $matches)) {
        $sheet_id = $matches[1];
    } else {
        $sheet_id = trim($sheet_url);
    }

    $csv_url  = 'https://docs.google.com/spreadsheets/d/' . $sheet_id . '/export?format=csv';
    $response = wp_remote_get($csv_url, array('timeout' => 10));

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        return array();
    }

    $body = wp_remote_retrieve_body($response);

    // fgetcsv handles multi-line quoted fields (e.g. addresses with newlines)
    $tmp = tmpfile();
    fwrite($tmp, $body);
    rewind($tmp);

    $rows = array();
    while (($row = fgetcsv($tmp)) !== false) {
        $rows[] = $row;
    }
    fclose($tmp);

    if (empty($rows)) return array();

    // Normalize headers: lowercase + spaces → underscores ("Phone number" → "phone_number")
    $header = array_map(function ($h) {
        return strtolower(preg_replace('/\s+/', '_', trim($h)));
    }, array_shift($rows));

    $header_count = count($header);

    $specialists = array();
    foreach ($rows as $row) {
        // Pad short rows; trim overlong ones — then combine
        $row = array_pad(array_slice($row, 0, $header_count), $header_count, '');
        $data = array_combine($header, array_map('trim', $row));

        $lat = isset($data['lat']) ? floatval($data['lat']) : 0;
        $lng = isset($data['lng']) ? floatval($data['lng']) : 0;
        if ($lat === 0.0 && $lng === 0.0) continue;

        // "phone_number" (new sheet) or "phone" (legacy column name)
        $phone = isset($data['phone_number']) && $data['phone_number'] !== ''
            ? $data['phone_number']
            : (isset($data['phone']) ? $data['phone'] : '');

        $specialists[] = array(
            'institution' => isset($data['institution']) ? $data['institution']            : '',
            'specialist'  => isset($data['specialist'])  ? $data['specialist']             : '',
            'address'     => isset($data['address'])     ? $data['address']                : '',
            'phone'       => $phone,
            'type'        => isset($data['type'])        ? $data['type']                   : '',
            'omas_cases'  => isset($data['omas_cases'])  ? intval($data['omas_cases'])     : 0,
            'registry'    => isset($data['registry'])    ? $data['registry']               : '',
            'picture'     => isset($data['picture'])     ? esc_url(trim($data['picture'])) : '',
            'video'       => isset($data['video'])       ? esc_url(trim($data['video']))   : '',
            'url'         => isset($data['url'])         ? esc_url(trim($data['url']))     : '',
            'lat'         => $lat,
            'lng'         => $lng,
        );
    }

    set_transient('map_plugin_specialists_data', $specialists, HOUR_IN_SECONDS);
    return $specialists;
}

// ── Admin settings page ───────────────────────────────────────────────────────

add_action('admin_menu', 'map_plugin_admin_menu');

function map_plugin_admin_menu() {
    add_options_page(
        'Map Plugin Settings',
        'Map Plugin',
        'manage_options',
        'map-plugin-settings',
        'map_plugin_settings_page'
    );
}

add_action('admin_init', 'map_plugin_register_settings');

function map_plugin_register_settings() {
    register_setting('map_plugin_options', 'map_plugin_sheet_url', array(
        'sanitize_callback' => 'sanitize_text_field',
    ));
    register_setting('map_plugin_options', 'map_plugin_specialists_sheet_url', array(
        'sanitize_callback' => 'sanitize_text_field',
    ));
}

function map_plugin_settings_page() {
    if (isset($_GET['settings-updated'])) {
        delete_transient('map_plugin_sheet_data');
        delete_transient('map_plugin_specialists_data');
    }
    ?>
    <div class="wrap">
        <h1>Map Plugin Settings</h1>
        <p>Both sheets must be set to <strong>"Anyone with the link can view"</strong>.</p>

        <form method="post" action="options.php">
            <?php settings_fields('map_plugin_options'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="map_plugin_sheet_url">Patients Google Sheet URL</label></th>
                    <td>
                        <input
                            type="text"
                            id="map_plugin_sheet_url"
                            name="map_plugin_sheet_url"
                            value="<?php echo esc_attr(get_option('map_plugin_sheet_url', '')); ?>"
                            class="regular-text"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        <p class="description">Row 1 headers: <code>name, count, lat, lng</code></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="map_plugin_specialists_sheet_url">Specialists Google Sheet URL</label></th>
                    <td>
                        <input
                            type="text"
                            id="map_plugin_specialists_sheet_url"
                            name="map_plugin_specialists_sheet_url"
                            value="<?php echo esc_attr(get_option('map_plugin_specialists_sheet_url', '')); ?>"
                            class="regular-text"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                        <p class="description">Row 1 headers: <code>Institution, Specialist, Address, Phone number, Type, OMAS Cases, Registry, Picture, Video, lat, lng</code> (optional: <code>url</code> for website link)</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save & Refresh Map Data'); ?>
        </form>
    </div>
    <?php
}
