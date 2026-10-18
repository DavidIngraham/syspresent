import unittest
from scripts.package_review import validate_evidence

class SvgEvidenceTests(unittest.TestCase):
    def test_standard_matplotlib_doctype_is_not_resolved(self):
        value = b'''<?xml version="1.0"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L1 1"/></svg>'''
        validate_evidence('plot.svg', value, 'figure')
    def test_custom_entities_and_external_assets_are_rejected(self):
        for value in [b'<!DOCTYPE svg [<!ENTITY x "bad">]><svg/>',b'<!DOCTYPE svg SYSTEM "https://example.test/dtd"><svg/>',b'<svg><image href="https://example.test/image"/></svg>']:
            with self.assertRaises(ValueError): validate_evidence('plot.svg',value,'figure')
