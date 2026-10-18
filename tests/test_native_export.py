import unittest
from scripts.native_export import build_index, adapt_view


class NativeIndexTests(unittest.TestCase):
    def test_native_quantity_preserves_exact_magnitude_and_unit(self):
        from fractions import Fraction
        from scripts.native_export import typed_value, Quantity
        if not Quantity:
            self.skipTest("Native client unavailable")
        from opensysml.values import Unit, UnitFactor
        value = Quantity(Fraction(2, 25), Unit("kg", factors=(UnitFactor("SI::kg", 1),), reduction_given=True))
        encoded = typed_value(value)
        self.assertEqual(encoded["nativeType"], "Quantity")
        self.assertEqual(encoded["magnitude"], {"nativeType": "Rational", "numerator": 2, "denominator": 25})
        self.assertEqual(encoded["unit"]["text"], "kg")
        self.assertEqual(encoded["unit"]["factors"][0]["unit_id"], "SI::kg")
        self.assertTrue(encoded["unit"]["reduction_given"])

    def test_native_reference_direction_and_unknown_target(self):
        raw=[{"@id":"a","@type":"PartUsage","declaredName":"misleading satisfy label","type":[{"@id":"lib"}],"owner":{"@id":"missing"}}]
        query=[{"id":"Library::Type","type":"PartDefinition","properties":{"elementId":"lib","name":"Type"}}]
        elements, edges, missing=build_index(raw,query,library_ids={"lib"})
        self.assertEqual(edges[0]["source"],"a")
        self.assertEqual(edges[0]["kind"],"type")
        self.assertEqual(elements[1]["owner"],"library")
        self.assertEqual(missing,["missing"])
        self.assertFalse(any(edge["kind"]=="satisfy" for edge in edges))

    def test_ambiguous_query_identity_fails_closed(self):
        from types import SimpleNamespace
        from scripts.native_export import query_view
        with self.assertRaisesRegex(ValueError, "Ambiguous native qualified name"):
            query_view({"id":"q","native":"Q"},SimpleNamespace(rows=[],columns=[]),[
                {"id":"a","qualifiedName":"M::same"},{"id":"b","qualifiedName":"M::same"}])

    def test_native_matrix_rows_use_transport_identity_not_cell_labels(self):
        payload={"kind":"matrix","rows":[
            {"cells":["Misleading::Name","verify"],"semantic_id":"native-row-id","identity_status":"mapped"},
            {"cells":["native-row-id","satisfy"],"identity_status":"unmapped"}]}
        view,edges=adapt_view("matrix",payload)
        self.assertEqual(view["rowToElement"],{"0":"native-row-id","1":None})
        self.assertEqual(view["elementIds"],["native-row-id"])
        self.assertEqual(view["identityCoverage"]["unmappedRows"],["1"])
        self.assertIs(view["native"],payload)
        self.assertEqual(edges,[])

    def test_render_identity_is_not_local_id_or_label(self):
        payload={"kind":"requirement","nodes":[{"id":"n0","semantic_id":"part-id","name":"wrong-name"},{"id":"n1","semantic_id":"req-id"},{"id":"n2"}],"edges":[{"from_id":"n0","to_id":"n1","kind":"satisfy"},{"from_id":"n2","to_id":"n1","kind":"synthetic"}]}
        view,edges=adapt_view("requirements",payload)
        self.assertEqual(view["nodeToElement"],{"n0":"part-id","n1":"req-id","n2":None})
        self.assertEqual(edges[0]["source"],"part-id")
        self.assertEqual(len(edges),1)
        self.assertIs(view["native"],payload)
        self.assertEqual(view["identityCoverage"]["unmappedNodes"],["n2"])
        self.assertEqual(len(view["identityCoverage"]["unmappedEdges"]),1)


if __name__ == "__main__": unittest.main()
